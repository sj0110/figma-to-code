// server.js - Enhanced Express Backend Server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/figma_plugin');

// MongoDB Schemas
const ProjectSchema = new mongoose.Schema({
    figmaFileId: String,
    frames: [{
        frameId: String,
        frameName: String,
        designData: Object,
        generatedCode: String,
        commitHash: String,
        filePath: String,
        createdAt: { type: Date, default: Date.now },
    }],
    repository: String,
    framework: String,
    repoStructure: {
        type: Object,
        default: {}
    },
    existingFiles: {
        type: Map,
        of: String,
        default: {}
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', ProjectSchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const flashModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
});

// Helper Functions
function parseRepoUrl(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub repository URL');
    return { owner: match[1], repo: match[2].replace('.git', '') };
}

async function getRepoContext(octokit, owner, repo, branch) {
    try {
        const { data: tree } = await octokit.git.getTree({
            owner,
            repo,
            tree_sha: branch,
            recursive: '1'
        });

        const structure = {
            components: [],
            pages: [],
            screens: [],
            utils: [],
            styles: [],
            config: []
        };

        tree.tree.forEach(item => {
            if (item.type === 'blob') {
                const path = item.path.toLowerCase();
                if (path.includes('component')) structure.components.push(item.path);
                else if (path.includes('page')) structure.pages.push(item.path);
                else if (path.includes('screen')) structure.screens.push(item.path);
                else if (path.includes('util') || path.includes('helper')) structure.utils.push(item.path);
                else if (path.includes('style') || path.includes('.css')) structure.styles.push(item.path);
                else if (path.includes('config') || path.includes('.json')) structure.config.push(item.path);
            }
        });

        return structure;
    } catch (error) {
        console.warn('Could not fetch repo context:', error.message);
        return null;
    }
}

async function getExistingFiles(octokit, owner, repo, branch, paths) {
    const files = {};

    for (const path of paths.slice(0, 10)) {
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });

            if (data.content) {
                files[path] = Buffer.from(data.content, 'base64').toString('utf8');
            }
        } catch (error) {
            console.warn(`Could not fetch ${path}:`, error.message);
        }
    }

    return files;
}

function getLatestPackageVersions(framework) {
    const versions = {
        'nextjs': {
            framework: 'Next.js 15',
            packages: {
                'next': '^15.0.0',
                'react': '^19.0.0',
                'react-dom': '^19.0.0',
                'typescript': '^5.6.0',
                'tailwindcss': '^3.4.0'
            },
            imports: {
                'Image': "import Image from 'next/image';",
                'Link': "import Link from 'next/link';",
                'useRouter': "import { useRouter } from 'next/navigation';",
                'useState': "import { useState } from 'react';"
            }
        },
        'react': {
            framework: 'React 19',
            packages: {
                'react': '^19.0.0',
                'react-dom': '^19.0.0',
                'typescript': '^5.6.0',
                'tailwindcss': '^3.4.0'
            },
            imports: {
                'useState': "import { useState } from 'react';",
                'useEffect': "import { useEffect } from 'react';",
                'useMemo': "import { useMemo } from 'react';"
            }
        },
        'react-native': {
            framework: 'React Native 0.76',
            packages: {
                'react-native': '^0.76.0',
                'react': '^18.3.0',
                'expo': '~52.0.0',
                'typescript': '^5.6.0'
            },
            imports: {
                'View': "import { View } from 'react-native';",
                'Text': "import { Text } from 'react-native';",
                'TouchableOpacity': "import { TouchableOpacity } from 'react-native';",
                'StyleSheet': "import { StyleSheet } from 'react-native';",
                'SafeAreaView': "import { SafeAreaView } from 'react-native-safe-area-context';"
            }
        },
        'vue': {
            framework: 'Vue 3.5',
            packages: {
                'vue': '^3.5.0',
                'typescript': '^5.6.0',
                'tailwindcss': '^3.4.0'
            },
            imports: {
                'ref': "import { ref } from 'vue';",
                'computed': "import { computed } from 'vue';",
                'onMounted': "import { onMounted } from 'vue';"
            }
        },
        'angular': {
            framework: 'Angular 18',
            packages: {
                '@angular/core': '^18.0.0',
                '@angular/common': '^18.0.0',
                'typescript': '^5.6.0',
                'tailwindcss': '^3.4.0'
            },
            imports: {
                'Component': "import { Component } from '@angular/core';",
                'Input': "import { Input } from '@angular/core';",
                'Output': "import { Output, EventEmitter } from '@angular/core';"
            }
        }
    };

    return versions[framework] || versions['nextjs'];
}

function generateEnhancedPrompt(designData, framework, repoContext, existingFiles) {
    const versionInfo = getLatestPackageVersions(framework);
    const hasContext = repoContext && Object.keys(existingFiles).length > 0;

    return `
### ROLE
You are a Senior Frontend Engineer specialized in high-performance UI implementation. Your task is to transform structured design data into a pixel-perfect, production-grade ${framework} component that integrates seamlessly with existing code.

### CRITICAL: LATEST PACKAGE VERSIONS
You MUST use the following LATEST versions and their current syntax:
**Framework:** ${versionInfo.framework}
**Package Versions:**
${Object.entries(versionInfo.packages).map(([pkg, ver]) => `- ${pkg}: ${ver}`).join('\n')}

**Required Import Syntax (Current 2024 Standards):**
${Object.entries(versionInfo.imports).map(([name, imp]) => `- ${imp}`).join('\n')}

⚠️ CRITICAL: Verify all imports, APIs, and syntax match the versions above. Do NOT use deprecated patterns.

### SOURCE DATA (JSON)
${JSON.stringify(designData, null, 2)}

${hasContext ? `
### EXISTING REPOSITORY CONTEXT
This component will be added to an existing project. DO NOT overwrite or duplicate existing components.

**Repository Structure:**
- Components: ${repoContext.components.length} files
- Pages/Screens: ${repoContext.pages.length + repoContext.screens.length} files
- Utils: ${repoContext.utils.length} files

**Existing Key Files:**
${Object.keys(existingFiles).map(path => `- ${path}`).join('\n')}

**Sample Existing Code:**
${Object.entries(existingFiles).slice(0, 2).map(([path, content]) =>
        `File: ${path}
\`\`\`
${content.substring(0, 500)}...
\`\`\`
`).join('\n')}

### INTEGRATION REQUIREMENTS
1. **No Duplication:** Check existing components. If similar component exists, reference it or extend it.
2. **Consistent Patterns:** Match the coding style, naming conventions, and structure of existing code.
3. **Import Existing:** Import and reuse existing utilities, types, and components where applicable.
4. **File Path:** Choose appropriate path that fits repository structure (e.g., if other components are in /components, use that).
` : ''}

### TECHNICAL STACK
- **Framework:** ${framework}
- **Styling:** ${framework === 'react-native' ? 'StyleSheet (NO Tailwind)' : 'Tailwind CSS (utility-first)'}
- **Language:** TypeScript (Strict Mode)

### CORE REQUIREMENTS
1. **Architecture:** Use a "Composition over Inheritance" pattern. Create reusable sub-components within the same file.
2. **Prop Mapping:** Map JSON design data directly to component props. Use TypeScript interfaces for type safety.
3. **Accessibility (A11y):** Use semantic HTML/React Native components with proper ARIA labels and focus states.
4. **Responsiveness:** ${framework === 'react-native' ? 'Use Dimensions API and Flexbox' : 'Use Tailwind breakpoints (sm:, md:, lg:, xl:)'}
5. **Robustness:** Handle null/undefined states gracefully with sensible defaults.

### FRAMEWORK-SPECIFIC CONSTRAINTS
${framework === 'nextjs' ? `
- **Architecture:** Next.js 15 with App Router
- **Client Components:** Use 'use client' directive ONLY when using hooks (useState, useEffect)
- **Image Optimization:** Use next/image with proper width/height
- **Routing:** Use next/navigation (NOT next/router)
- **NO <Head> component** - metadata should be exported as const metadata object in page files
- **Example Import:** import { useRouter } from 'next/navigation';` : ''}

${framework === 'react' ? `
- **State Management:** Use modern React 19 hooks (useState, useMemo, useTransition)
- **Types:** Export comprehensive Props interface
- **Suspense:** Use Suspense boundaries for async operations where appropriate` : ''}

${framework === 'react-native' ? `
- **Layout:** Use Flexbox exclusively (NO Tailwind, NO NativeWind)
- **Components:** Use SafeAreaView, ScrollView, Pressable for interactions
- **Styling:** Use StyleSheet.create() for all styles
- **Platform:** Use Platform API for platform-specific code
- **Current RN API:** Use latest React Native 0.76 APIs
- **Example:**
\`\`\`tsx
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Use expo packages where needed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
\`\`\`
` : ''}

${framework === 'vue' ? `
- **Composition API:** Use <script setup lang="ts"> syntax
- **Reactivity:** Use ref(), computed(), watch() from Vue 3.5
- **TypeScript:** Use defineProps<Props>() and defineEmits<Emits>()` : ''}

${framework === 'angular' ? `
- **Standalone Components:** Use standalone: true (Angular 18 default)
- **Signals:** Use Angular 18 signals for reactive state
- **Decorators:** Use @Component, @Input(), @Output()` : ''}

### COLOR EXTRACTION RULES
Parse the design data's color palette and map to ${framework === 'react-native' ? 'StyleSheet constants' : 'Tailwind config or inline hex values'}:
- If design has primary color #155dfc → Use consistently throughout
- Extract all colors from designData.designSystem.colors

### TYPOGRAPHY RULES
Parse typography from designData.designSystem.typography:
- Font families, sizes, weights, line heights
- ${framework === 'react-native' ? 'Use fontFamily, fontSize in StyleSheet' : 'Map to Tailwind classes (text-lg, font-semibold, etc.)'}

### OUTPUT SPECIFICATION
1. **File Path Comment:** Include suggested file path at top
2. **Single File:** Provide complete, copy-pasteable code
3. **No Explanations:** ONLY code, no markdown explanations before or after
4. **Version Compliance:** Ensure all syntax matches ${versionInfo.framework}
5. **Integration Ready:** Code should work immediately when added to the repository

Generate the production-ready code now:`;
}

async function generateWithRetry(model, prompt, maxRetries = 4) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (err) {
            const isOverload = err.status === 503 || err.message?.includes('503');

            if (!isOverload || attempt === maxRetries) {
                throw err;
            }

            const wait = 600 * attempt + Math.random() * 400;
            console.warn(`⚠️ Gemini overloaded. Retry ${attempt} in ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
        }
    }
}

// API Routes

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/extract', async (req, res) => {
    try {
        const { designData, figmaFileId } = req.body;

        if (!designData) {
            return res.status(400).json({ error: 'Design data is required' });
        }

        let project = await Project.findOne({ figmaFileId });

        if (!project) {
            project = new Project({ figmaFileId, frames: [] });
        }

        const frameIndex = project.frames.findIndex(
            f => f.frameId === designData.metadata.frameId
        );

        if (frameIndex >= 0) {
            project.frames[frameIndex].designData = designData;
        } else {
            project.frames.push({
                frameId: designData.metadata.frameId,
                frameName: designData.metadata.frameName,
                designData: designData,
            });
        }

        project.updatedAt = new Date();
        await project.save();

        res.json({
            success: true,
            projectId: project._id,
            message: 'Design data processed successfully',
        });
    } catch (error) {
        console.error('Extract error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate', async (req, res) => {
    try {
        const { designData, framework = 'nextjs', repoUrl } = req.body;

        if (!designData) {
            return res.status(400).json({ error: 'Design data is required' });
        }

        let repoContext = null;
        let existingFiles = {};

        if (repoUrl) {
            try {
                const { owner, repo } = parseRepoUrl(repoUrl);
                const octokit = new Octokit();

                const { data: repoData } = await octokit.repos.get({ owner, repo });
                const defaultBranch = repoData.default_branch;

                repoContext = await getRepoContext(octokit, owner, repo, defaultBranch);

                if (repoContext) {
                    const relevantPaths = [
                        ...repoContext.components.slice(0, 5),
                        ...repoContext.pages.slice(0, 3)
                    ];
                    existingFiles = await getExistingFiles(octokit, owner, repo, defaultBranch, relevantPaths);
                }
            } catch (error) {
                console.warn('Could not fetch repo context:', error.message);
            }
        }

        const prompt = generateEnhancedPrompt(designData, framework, repoContext, existingFiles);

        const result = await generateWithRetry(flashModel, prompt);
        const response = await result.response;
        let generatedCode = response.text();

        generatedCode = generatedCode.replace(/```(?:typescript|tsx|jsx|javascript|ts|js)?\n?/g, '').replace(/```\s*$/g, '').trim();

        const project = await Project.findOne({
            figmaFileId: designData.metadata.figmaFileId,
        });

        if (project) {
            if (repoContext) {
                project.repoStructure = repoContext;
            }

            const frameIndex = project.frames.findIndex(
                f => f.frameId === designData.metadata.frameId
            );

            if (frameIndex >= 0) {
                project.frames[frameIndex].generatedCode = generatedCode;
                project.framework = framework;
                project.updatedAt = new Date();
                await project.save();
            }
        }

        res.json({
            success: true,
            code: generatedCode,
            framework: framework,
            hasRepoContext: !!repoContext
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/commit', async (req, res) => {
    try {
        const { code, repoUrl, githubToken, frameName, branchName } = req.body;

        if (!code || !repoUrl || !githubToken) {
            return res.status(400).json({
                error: 'Code, repository URL, and GitHub token are required',
            });
        }

        const { owner, repo } = parseRepoUrl(repoUrl);
        const octokit = new Octokit({ auth: githubToken });

        const { data: repoData } = await octokit.repos.get({ owner, repo });
        const targetBranch = branchName || repoData.default_branch;

        const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${targetBranch}`,
        });
        const latestCommitSha = refData.object.sha;

        const { data: commitData } = await octokit.git.getCommit({
            owner,
            repo,
            commit_sha: latestCommitSha,
        });
        const treeSha = commitData.tree.sha;

        const sanitizedName = frameName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        let filename;
        if (code.includes('react-native') || code.includes('StyleSheet')) {
            filename = `screens/${sanitizedName}.tsx`;
        } else if (code.includes('use client') || code.includes('useState')) {
            filename = `components/${sanitizedName}.tsx`;
        } else {
            filename = `components/${sanitizedName}.tsx`;
        }

        const { data: blobData } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(code).toString('base64'),
            encoding: 'base64',
        });

        const { data: newTree } = await octokit.git.createTree({
            owner,
            repo,
            base_tree: treeSha,
            tree: [
                {
                    path: filename,
                    mode: '100644',
                    type: 'blob',
                    sha: blobData.sha,
                },
            ],
        });

        const { data: newCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message: `feat: Add ${frameName} component from Figma design\n\nGenerated using AI-powered Figma plugin`,
            tree: newTree.sha,
            parents: [latestCommitSha],
        });

        await octokit.git.updateRef({
            owner,
            repo,
            ref: `heads/${targetBranch}`,
            sha: newCommit.sha,
        });

        const project = await Project.findOne({ repository: repoUrl });
        if (project) {
            const frameIndex = project.frames.findIndex(
                f => f.frameName === frameName
            );
            if (frameIndex >= 0) {
                project.frames[frameIndex].commitHash = newCommit.sha;
                project.frames[frameIndex].filePath = filename;
                await project.save();
            }
        }

        res.json({
            success: true,
            commitHash: newCommit.sha,
            commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
            fileUrl: `https://github.com/${owner}/${repo}/blob/${targetBranch}/${filename}`,
            filePath: filename
        });
    } catch (error) {
        console.error('Commit error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({
            success: true,
            project: {
                id: project._id,
                figmaFileId: project.figmaFileId,
                frameCount: project.frames.length,
                framework: project.framework,
                repository: project.repository,
                repoStructure: project.repoStructure,
                frames: project.frames.map(f => ({
                    frameId: f.frameId,
                    frameName: f.frameName,
                    hasCode: !!f.generatedCode,
                    commitHash: f.commitHash,
                    filePath: f.filePath,
                    createdAt: f.createdAt,
                })),
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ updatedAt: -1 })
            .limit(50);

        res.json({
            success: true,
            projects: projects.map(p => ({
                id: p._id,
                figmaFileId: p.figmaFileId,
                frameCount: p.frames.length,
                framework: p.framework,
                repository: p.repository,
                updatedAt: p.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB connected to ${process.env.MONGODB_URI || 'localhost'}`);
    console.log(`🤖 Gemini AI initialized with latest version constraints`);
});

module.exports = app;