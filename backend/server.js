// server.js - Express Backend Server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/figma_plugin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// MongoDB Schemas
const ProjectSchema = new mongoose.Schema({
    figmaFileId: String,
    frames: [{
        frameId: String,
        frameName: String,
        designData: Object,
        generatedCode: String,
        commitHash: String,
        createdAt: { type: Date, default: Date.now },
    }],
    repository: String,
    framework: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', ProjectSchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper Functions
function parseRepoUrl(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub repository URL');
    return { owner: match[1], repo: match[2].replace('.git', '') };
}

function generatePrompt(designData, framework) {
    return `You are an expert frontend developer. Generate production-ready ${framework} code based on the following design data.

            DESIGN DATA:
            ${JSON.stringify(designData, null, 2)}

            REQUIREMENTS:
            1. Generate clean, maintainable, and well-structured code
            2. Use ${framework} best practices and conventions
            3. Include proper TypeScript types if applicable
            4. Implement responsive design
            5. Add proper accessibility attributes
            6. Use Tailwind CSS for styling
            7. Extract reusable components where appropriate
            8. Add meaningful comments for complex logic
            9. Ensure the component is self-contained and ready to use

            FRAMEWORK-SPECIFIC GUIDELINES:
            ${framework === 'nextjs' ? `
            - Use Next.js 14+ App Router conventions
            - Create a page.tsx or component file
            - Use 'use client' directive if needed
            - Implement proper metadata
            ` : ''}
            ${framework === 'react' ? `
            - Create functional components with hooks
            - Use proper prop types or TypeScript interfaces
            - Implement error boundaries if needed
            ` : ''}
            ${framework === 'vue' ? `
            - Use Vue 3 Composition API
            - Implement proper script setup
            - Use proper component naming conventions
            ` : ''}

            OUTPUT FORMAT:
            Provide the complete code in a single file, properly formatted and ready to be committed to a repository.
            Include the filename as a comment at the top.

            Generate the code now:`;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extract and process design data
app.post('/api/extract', async (req, res) => {
    try {
        const { designData, figmaFileId } = req.body;

        if (!designData) {
            return res.status(400).json({ error: 'Design data is required' });
        }

        // Find or create project
        let project = await Project.findOne({ figmaFileId });

        if (!project) {
            project = new Project({ figmaFileId, frames: [] });
        }

        // Add or update frame data
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

// Generate code with AI
app.post('/api/generate', async (req, res) => {
    try {
        const { designData, framework = 'nextjs' } = req.body;

        if (!designData) {
            return res.status(400).json({ error: 'Design data is required' });
        }

        // Generate prompt
        const prompt = generatePrompt(designData, framework);

        // Call Gemini AI
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedCode = response.text();

        // Save to database
        const project = await Project.findOne({
            figmaFileId: designData.metadata.figmaFileId,
        });

        if (project) {
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
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Commit to repository
app.post('/api/commit', async (req, res) => {
    try {
        const { code, repoUrl, githubToken, frameName } = req.body;

        if (!code || !repoUrl || !githubToken) {
            return res.status(400).json({
                error: 'Code, repository URL, and GitHub token are required',
            });
        }

        // Parse repository URL
        const { owner, repo } = parseRepoUrl(repoUrl);

        // Initialize Octokit
        const octokit = new Octokit({ auth: githubToken });

        // Get default branch
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        // Get latest commit SHA
        const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${defaultBranch}`,
        });
        const latestCommitSha = refData.object.sha;

        // Get the tree
        const { data: commitData } = await octokit.git.getCommit({
            owner,
            repo,
            commit_sha: latestCommitSha,
        });
        const treeSha = commitData.tree.sha;

        // Create sanitized filename
        const sanitizedName = frameName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const filename = `components/${sanitizedName}.tsx`;

        // Create blob for the file
        const { data: blobData } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(code).toString('base64'),
            encoding: 'base64',
        });

        // Create new tree
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

        // Create commit
        const { data: newCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message: `feat: Add ${frameName} component generated from Figma`,
            tree: newTree.sha,
            parents: [latestCommitSha],
        });

        // Update reference
        await octokit.git.updateRef({
            owner,
            repo,
            ref: `heads/${defaultBranch}`,
            sha: newCommit.sha,
        });

        // Update database
        const project = await Project.findOne({ repository: repoUrl });
        if (project) {
            const frameIndex = project.frames.findIndex(
                f => f.frameName === frameName
            );
            if (frameIndex >= 0) {
                project.frames[frameIndex].commitHash = newCommit.sha;
                await project.save();
            }
        }

        res.json({
            success: true,
            commitHash: newCommit.sha,
            commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
            fileUrl: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${filename}`,
        });
    } catch (error) {
        console.error('Commit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get project status
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
                frames: project.frames.map(f => ({
                    frameId: f.frameId,
                    frameName: f.frameName,
                    hasCode: !!f.generatedCode,
                    commitHash: f.commitHash,
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

// Get all projects
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB connected to ${process.env.MONGODB_URI || 'localhost'}`);
    console.log(`🤖 Gemini AI initialized`);
});

module.exports = app;