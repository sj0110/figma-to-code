// File Path: app/login/page.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DesignData {
  metadata: {
    frameName: string;
    frameId: string;
    extractedAt: string;
  };
  designSystem: {
    colors: {
      "color-1": string;
      "color-2": string;
      "color-3": string;
      "color-4": string;
      "color-5": string;
      "color-6": string;
      "color-7": string;
      "color-8": string;
      "color-9": string;
      "color-10": string;
    };
    typography: Typography[];
  };
  structure: Frame;
}

interface Typography {
  fontFamily: {
    family: string;
    style: string;
  };
  fontSize: number;
  fontWeight: number;
  lineHeight: {
    unit: string;
    value: number;
  };
  letterSpacing: {
    unit: string;
    value: number;
  };
}

interface Frame {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  relativeTransform: number[][];
  constraints: {
    horizontal: string;
    vertical: string;
  };
  fills: Fill[];
  strokes: Stroke[];
  strokeWeight: number;
  cornerRadius: number;
  effects: any[];
  blendMode: string;
  layoutAlign: string;
  layoutGrow: number;
  layoutMode: string;
  itemSpacing: number;
  children?: Frame[];
}

interface Fill {
  type: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  gradientStops?: GradientStop[];
  boundVariables?: {};
}

interface GradientStop {
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  position: number;
  boundVariables?: {};
}

interface Stroke {
  type: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  color: {
    r: number;
    g: number;
    b: number;
  };
  boundVariables?: {};
}

const designData: DesignData = {
  "metadata": {
    "frameName": "00 - Login",
    "frameId": "2:2832",
    "extractedAt": "2025-12-22T07:49:11.676Z"
  },
  "designSystem": {
    "colors": {
      "color-1": "#ffffff",
      "color-2": "#0a0a0a",
      "color-3": "#155dfc",
      "color-4": "#6a7282",
      "color-5": "#4a5565",
      "color-6": "#f3f3f5",
      "color-7": "#717182",
      "color-8": "#dbeafe",
      "color-9": "#4285f4",
      "color-10": "#34a853"
    },
    "typography": [
      {
        "fontFamily": {
          "family": "Inter",
          "style": "Regular"
        },
        "fontSize": 30,
        "fontWeight": 400,
        "lineHeight": {
          "unit": "PIXELS",
          "value": 36
        },
        "letterSpacing": {
          "unit": "PIXELS",
          "value": 0.3955078125
        }
      },
      {
        "fontFamily": {
          "family": "Inter",
          "style": "Medium"
        },
        "fontSize": 14,
        "fontWeight": 500,
        "lineHeight": {
          "unit": "PIXELS",
          "value": 20
        },
        "letterSpacing": {
          "unit": "PIXELS",
          "value": -0.150390625
        }
      }
    ]
  },
  "structure": {
    "id": "2:2832",
    "name": "00 - Login",
    "type": "FRAME",
    "x": 132,
    "y": 383,
    "width": 376,
    "height": 901,
    "relativeTransform": [
      [
        1,
        0,
        132
      ],
      [
        0,
        1,
        383
      ]
    ],
    "constraints": {
      "horizontal": "MIN",
      "vertical": "MIN"
    },
    "fills": [
      {
        "type": "SOLID",
        "visible": true,
        "opacity": 1,
        "blendMode": "NORMAL",
        "color": {
          "r": 1,
          "g": 1,
          "b": 1
        },
        "boundVariables": {}
      },
      {
        "type": "GRADIENT_LINEAR",
        "visible": true,
        "opacity": 1,
        "blendMode": "NORMAL",
        "gradientStops": [
          {
            "color": {
              "r": 0.08361906558275223,
              "g": 0.3644171357154846,
              "b": 0.9863430261611938,
              "a": 1
            },
            "position": 0,
            "boundVariables": {}
          },
          {
            "color": {
              "r": 0.30980393290519714,
              "g": 0.2235294133424759,
              "b": 0.9647058844566345,
              "a": 1
            },
            "position": 1,
            "boundVariables": {}
          }
        ],
        "gradientTransform": [
          [
            0,
            1,
            0
          ],
          [
            -0.5,
            0,
            0.75
          ]
        ]
      }
    ],
    "strokes": [],
    "strokeWeight": 1,
    "cornerRadius": 0,
    "effects": [],
    "blendMode": "PASS_THROUGH",
    "layoutAlign": "INHERIT",
    "layoutGrow": 0,
    "layoutMode": "NONE",
    "itemSpacing": 0,
    "children": [
      {
        "id": "2:2833",
        "name": "Container",
        "type": "FRAME",
        "x": 98.2218017578125,
        "y": 25.996498107910156,
        "width": 179.66847229003906,
        "height": 159.97315979003906,
        "relativeTransform": [
          [
            1,
            0,
            98.2218017578125
          ],
          [
            0,
            1,
            25.996498107910156
          ]
        ],
        "constraints": {
          "horizontal": "MIN",
          "vertical": "MIN"
        },
        "fills": [],
        "strokes": [],
        "strokeWeight": 1,
        "cornerRadius": 0,
        "effects": [],
        "blendMode": "PASS_THROUGH",
        "layoutAlign": "INHERIT",
        "layoutGrow": 0,
        "layoutMode": "NONE",
        "itemSpacing": 0,
        "children": [
          {
            "id": "2:2834",
            "name": "Container",
            "type": "FRAME",
            "x": 49.83411407470703,
            "y": 0,
            "width": 79.99112701416016,
            "height": 79.99112701416016,
            "relativeTransform": [
              [
                1,
                0,
                49.83411407470703
              ],
              [
                0,
                1,
                0
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [
              {
                "type": "SOLID",
                "visible": true,
                "opacity": 1,
                "blendMode": "NORMAL",
                "color": {
                  "r": 1,
                  "g": 1,
                  "b": 1
                },
                "boundVariables": {}
              }
            ],
            "strokes": [],
            "strokeWeight": 1,
            "cornerRadius": 16,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "HORIZONTAL",
            "itemSpacing": 0,
            "children": [
              {
                "id": "2:2835",
                "name": "Text",
                "type": "FRAME",
                "x": 22.660980224609375,
                "y": 21.99687957763672,
                "width": 34.669189453125,
                "height": 35.997371673583984,
                "relativeTransform": [
                  [
                    1,
                    0,
                    22.660980224609375
                  ],
                  [
                    0,
                    1,
                    21.99687957763672
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [],
                "strokes": [],
                "strokeWeight": 1,
                "cornerRadius": 0,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 0,
                "layoutMode": "HORIZONTAL",
                "itemSpacing": 0,
                "children": [
                  {
                    "id": "2:2836",
                    "name": "C1",
                    "type": "TEXT",
                    "x": 0,
                    "y": 0,
                    "width": 37,
                    "height": 36,
                    "relativeTransform": [
                      [
                        1,
                        0,
                        0
                      ],
                      [
                        0,
                        1,
                        0
                      ]
                    ],
                    "constraints": {
                      "horizontal": "MIN",
                      "vertical": "MIN"
                    },
                    "fills": [
                      {
                        "type": "SOLID",
                        "visible": true,
                        "opacity": 1,
                        "blendMode": "NORMAL",
                        "color": {
                          "r": 0.08361906558275223,
                          "g": 0.3644171357154846,
                          "b": 0.9863430261611938
                        },
                        "boundVariables": {}
                      }
                    ],
                    "strokes": [],
                    "strokeWeight": 1,
                    "effects": [],
                    "blendMode": "PASS_THROUGH",
                    "layoutAlign": "INHERIT",
                    "layoutGrow": 0,
                    "children": []
                  }
                ]
              }
            ]
          },
          {
            "id": "2:2837",
            "name": "Heading 1",
            "type": "FRAME",
            "x": 0,
            "y": 95.98389434814453,
            "width": 179.66847229003906,
            "height": 35.997371673583984,
            "relativeTransform": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                95.98389434814453
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [],
            "strokes": [],
            "strokeWeight": 1,
            "cornerRadius": 0,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "HORIZONTAL",
            "itemSpacing": 0,
            "children": [
              {
                "id": "2:2838",
                "name": "Cignal One",
                "type": "TEXT",
                "x": 0,
                "y": 0,
                "width": 179.66847229003906,
                "height": 36,
                "relativeTransform": [
                  [
                    1,
                    0,
                    0
                  ],
                  [
                    0,
                    1,
                    0
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [
                  {
                    "type": "SOLID",
                    "visible": true,
                    "opacity": 1,
                    "blendMode": "NORMAL",
                    "color": {
                      "r": 1,
                      "g": 1,
                      "b": 1
                    },
                    "boundVariables": {}
                  }
                ],
                "strokes": [],
                "strokeWeight": 1,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 1,
                "children": []
              }
            ]
          },
          {
            "id": "2:2839",
            "name": "Paragraph",
            "type": "FRAME",
            "x": 0,
            "y": 139.9776611328125,
            "width": 179.66847229003906,
            "height": 19.995508193969727,
            "relativeTransform": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                139.9776611328125
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [],
            "strokes": [],
            "strokeWeight": 1,
            "cornerRadius": 0,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "NONE",
            "itemSpacing": 0,
            "children": [
              {
                "id": "2:2840",
                "name": "Your all-in-one account hub",
                "type": "TEXT",
                "x": 0,
                "y": 0.7466583251953125,
                "width": 180,
                "height": 20,
                "relativeTransform": [
                  [
                    1,
                    0,
                    0
                  ],
                  [
                    0,
                    1,
                    0.7466583251953125
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [
                  {
                    "type": "SOLID",
                    "visible": true,
                    "opacity": 1,
                    "blendMode": "NORMAL",
                    "color": {
                      "r": 0.85824054479599,
                      "g": 0.9178275465965271,
                      "b": 0.9972704648971558
                    },
                    "boundVariables": {}
                  }
                ],
                "strokes": [],
                "strokeWeight": 1,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 0,
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "2:2841",
        "name": "Container",
        "type": "FRAME",
        "x": 0,
        "y": 207.96966552734375,
        "width": 376.112060546875,
        "height": 692.5377807617188,
        "relativeTransform": [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            207.96966552734375
          ]
        ],
        "constraints": {
          "horizontal": "MIN",
          "vertical": "MIN"
        },
        "fills": [
          {
            "type": "SOLID",
            "visible": true,
            "opacity": 1,
            "blendMode": "NORMAL",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1
            },
            "boundVariables": {}
          }
        ],
        "strokes": [],
        "strokeWeight": 1,
        "effects": [],
        "blendMode": "PASS_THROUGH",
        "layoutAlign": "INHERIT",
        "layoutGrow": 0,
        "layoutMode": "NONE",
        "itemSpacing": 0,
        "children": [
          {
            "id": "2:2842",
            "name": "Heading 2",
            "type": "FRAME",
            "x": 23.998249053955078,
            "y": 31.99462890625,
            "width": 328.1155700683594,
            "height": 31.994632720947266,
            "relativeTransform": [
              [
                1,
                0,
                23.998249053955078
              ],
              [
                0,
                1,
                31.99462890625
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [],
            "strokes": [],
            "strokeWeight": 1,
            "cornerRadius": 0,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "NONE",
            "itemSpacing": 0,
            "children": [
              {
                "id": "2:2843",
                "name": "Welcome back",
                "type": "TEXT",
                "x": 0,
                "y": -0.8355712890625,
                "width": 167,
                "height": 32,
                "relativeTransform": [
                  [
                    1,
                    0,
                    0
                  ],
                  [
                    0,
                    1,
                    -0.8355712890625
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [
                  {
                    "type": "SOLID",
                    "visible": true,
                    "opacity": 1,
                    "blendMode": "NORMAL",
                    "color": {
                      "r": 0.03938823565840721,
                      "g": 0.03938823565840721,
                      "b": 0.03938823565840721
                    },
                    "boundVariables": {}
                  }
                ],
                "strokes": [],
                "strokeWeight": 1,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 0,
                "children": []
              }
            ]
          },
          {
            "id": "2:2844",
            "name": "Paragraph",
            "type": "FRAME",
            "x": 23.998249053955078,
            "y": 71.98565673828125,
            "width": 328.1155700683594,
            "height": 23.998249053955078,
            "relativeTransform": [
              [
                1,
                0,
                23.998249053955078
              ],
              [
                0,
                1,
                71.98565673828125
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [],
            "strokes": [],
            "strokeWeight": 1,
            "cornerRadius": 0,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "NONE",
            "itemSpacing": 0,
            "children": [
              {
                "id": "2:2845",
                "name": "Sign in to manage your Cignal services",
                "type": "TEXT",
                "x": 0,
                "y": -0.67138671875,
                "width": 282,
                "height": 24,
                "relativeTransform": [
                  [
                    1,
                    0,
                    0
                  ],
                  [
                    0,
                    1,
                    -0.67138671875
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [
                  {
                    "type": "SOLID",
                    "visible": true,
                    "opacity": 1,
                    "blendMode": "NORMAL",
                    "color": {
                      "r": 0.41545435786247253,
                      "g": 0.4470909833908081,
                      "b": 0.5104967951774597
                    },
                    "boundVariables": {}
                  }
                ],
                "strokes": [],
                "strokeWeight": 1,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 0,
                "children": []
              }
            ]
          },
          {
            "id": "2:2846",
            "name": "Button",
            "type": "FRAME",
            "x": 23.998249053955078,
            "y": 119.98214721679688,
            "width": 328.1155700683594,
            "height": 59.47708511352539,
            "relativeTransform": [
              [
                1,
                0,
                23.998249053955078
              ],
              [
                0,
                1,
                119.98214721679688
              ]
            ],
            "constraints": {
              "horizontal": "MIN",
              "vertical": "MIN"
            },
            "fills": [],
            "strokes": [
              {
                "type": "SOLID",
                "visible": true,
                "opacity": 1,
                "blendMode": "NORMAL",
                "color": {
                  "r": 0.08361906558275223,
                  "g": 0.3644171357154846,
                  "b": 0.9863430261611938
                },
                "boundVariables": {}
              }
            ],
            "strokeWeight": 1.746649980545044,
            "cornerRadius": 14,
            "effects": [],
            "blendMode": "PASS_THROUGH",
            "layoutAlign": "INHERIT",
            "layoutGrow": 0,
            "layoutMode": "HORIZONTAL",
            "itemSpacing": 11.99911880493164,
            "children": [
              {
                "id": "2:2847",
                "name": "Icon",
                "type": "FRAME",
                "x": 67.80096435546875,
                "y": 17.739410400390625,
                "width": 23.998249053955078,
                "height": 23.998249053955078,
                "relativeTransform": [
                  [
                    1,
                    0,
                    67.80096435546875
                  ],
                  [
                    0,
                    1,
                    17.739410400390625
                  ]
                ],
                "constraints": {
                  "horizontal": "MIN",
                  "vertical": "MIN"
                },
                "fills": [],
                "strokes": [],
                "strokeWeight": 0.9999270439147949,
                "cornerRadius": 0,
                "effects": [],
                "blendMode": "PASS_THROUGH",
                "layoutAlign": "INHERIT",
                "layoutGrow": 0,
                "layoutMode": "NONE",
                "itemSpacing": 0,
                "children": [
                  {
                    "id": "2:2848",
                    "name": "Vector",
                    "type": "VECTOR",
                    "x": 9.739287376403809,
                    "y": 9.99927043914795,
                    "width": 2.260000228881836,
                    "height": 6,
                    "relativeTransform": [
                      [
                        1,
                        0,
                        9.739287376403809
                      ],
                      [
                        0,
                        1,
                        9.99927043914795
                      ]
                    ],
                    "constraints": {
                      "horizontal": "SCALE",
                      "vertical": "SCALE"
                    },
                    "fills": [],
                    "strokes": [
                      {
                        "type": "SOLID",
                        "visible": true,
                        "opacity": 1,
                        "blendMode": "NORMAL",
                        "color": {
                          "r": 0.08235294371843338,
                          "g": 0.364705890417099,
                          "b": 0.9882352948188782
                        },
                        "boundVariables": {}
                      }
                    ],
                    "strokeWeight": 1.9998540878295898,
                    "cornerRadius": 0,
                    "effects": [],
                    "blendMode": "PASS_THROUGH",
                    "layoutAlign": "INHERIT",
                    "layoutGrow": 0,
                    "children": []
                  },
                  {
                    "id": "2:2849",
                    "name": "Vector",
                    "type": "VECTOR",
                    "x": 12.999052047729492,
                    "y": 13.119037628173828,
                    "width": 1,
                    "height": 8.880000114440918,
                    "relativeTransform": [
                      [
                        1,
                        0,
                        12.999052047729492
                      ],
                      [
                        0,
                        1,
                        13.119037628173828
                      ]
                    ],
                    "constraints": {
                      "horizontal": "SCALE",
                      "vertical": "SCALE"
                    },
                    "fills": [],
                    "strokes": [
                      {
                        "type": "SOLID",
                        "visible": true,
                        "opacity": 1,
                        "blendMode": "NORMAL",
                        "color": {
                          "r": 0.08235294371843338,
                          "g": 0.364705890417099,
                          "b": 0.9882352948188782
                        },
                        "boundVariables": {}
                      }
                    ],
                    "strokeWeight": 1.9998540878295898,
                    "cornerRadius": 0,
                    "effects": [],
                    "blendMode": "PASS_THROUGH",
                    "layoutAlign": "INHERIT",
                    "layoutGrow": 0,
                    "children": []
                  },
                  {
                    "id": "2:2850",
                    "name": "Vector",
                    "type": "VECTOR",
                    "x": 17.288740158081055,
                    "y": 17.998687744140625,
                    "width": 0.5,
                    "height": 3.020000457763672,
                    "relativeTransform": [
                      [
                        1,
                        0,
                        17.288740158081055
                      ],
                      [
                        0,
                        1,
                        17.998687744140625
                      ]
                    ],
                    "constraints": {
                      "horizontal": "SCALE",
                      "vertical": "SCALE"
                    },
                    "fills": [],
                    "strokes": [
                      {
                        "type": "SOLID",
                        "visible": true,
                        "opacity": 1,
                        "blendMode": "NORMAL",
                        "color": {
                          "r": 0.08235294371843338,
                          "g": 0.3647058904170