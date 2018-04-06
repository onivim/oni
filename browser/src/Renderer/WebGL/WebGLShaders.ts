// TODO refactor this into collections of the same interface

export const textBlendAttributes = {
    unitQuadVertex: 0,
    targetOrigin: 1,
    targetSize: 2,
    textColorRGBA: 3,
    atlasOrigin: 4,
    atlasSize: 5,
}

export const textBlendVertex = `
    #version 300 es

    layout (location = 0) in vec2 unitQuadVertex;
    layout (location = 1) in vec2 targetOrigin;
    layout (location = 2) in vec2 targetSize;
    layout (location = 3) in vec4 textColorRGBA;
    layout (location = 4) in vec2 atlasOrigin;
    layout (location = 5) in vec2 atlasSize;

    uniform vec2 viewportScale;

    flat out vec4 textColor;
    out vec2 atlasPosition;

    void main() {
        vec2 targetPixelPosition = targetOrigin + unitQuadVertex * targetSize;
        vec2 targetPosition = targetPixelPosition * viewportScale + vec2(-1.0, 1.0);
        gl_Position = vec4(targetPosition, 0.0, 1.0);
        textColor = textColorRGBA;
        atlasPosition = atlasOrigin + unitQuadVertex * atlasSize;
    }
`.trim()

export const textBlendPass1Fragment = `
    #version 300 es

    precision mediump float;

    layout(location = 0) out vec4 outColor;
    flat in vec4 textColor;
    in vec2 atlasPosition;

    uniform sampler2D atlasTexture;

    void main() {
      vec3 atlasColor = texture(atlasTexture, atlasPosition).rgb;
      vec3 textColorRGB = textColor.rgb;
      vec3 correctedAtlasColor = mix(vec3(1.0) - atlasColor, sqrt(vec3(1.0) - atlasColor * atlasColor), textColorRGB);
      outColor = vec4(correctedAtlasColor, 1.0);
    }
`.trim()

export const textBlendPass2Fragment = `
    #version 300 es

    precision mediump float;

    layout(location = 0) out vec4 outColor;
    flat in vec4 textColor;
    in vec2 atlasPosition;

    uniform sampler2D atlasTexture;

    void main() {
      vec3 atlasColor = texture(atlasTexture, atlasPosition).rgb;
      vec3 textColorRGB = textColor.rgb;
      vec3 correctedAtlasColor = mix(vec3(1.0) - atlasColor, sqrt(vec3(1.0) - atlasColor * atlasColor), textColorRGB);
      vec3 adjustedForegroundColor = textColorRGB * correctedAtlasColor;
      outColor = vec4(adjustedForegroundColor, 1.0);
    }
`.trim()

export const solidAttributes = {
    unitQuadVertex: 0,
    targetOrigin: 1,
    targetSize: 2,
    colorRGBA: 3,
}

export const solidVertex = `
    #version 300 es

    layout (location = 0) in vec2 unitQuadVertex;
    layout (location = 1) in vec2 targetOrigin;
    layout (location = 2) in vec2 targetSize;
    layout (location = 3) in vec4 colorRGBA;
    flat out vec4 color;

    uniform vec2 viewportScale;

    void main() {
        vec2 targetPixelPosition = targetOrigin + unitQuadVertex * targetSize;
        vec2 targetPosition = targetPixelPosition * viewportScale + vec2(-1.0, 1.0);
        gl_Position = vec4(targetPosition, 0.0, 1.0);
        color = colorRGBA * vec4(1.0 / 255.0);
    }
`.trim()

export const solidFragment = `
    #version 300 es

    precision mediump float;

    flat in vec4 color;
    layout (location = 0) out vec4 outColor;

    void main() {
      outColor = color;
    }
`.trim()

export const textSinglePassFragment = `
    #version 300 es

    precision mediump float;

    layout(location = 0) out vec4 outColor;
    flat in vec4 textColor;
    in vec2 atlasPosition;

    uniform sampler2D atlasTexture;

    void main() {
        vec4 atlasColor = texture(atlasTexture, atlasPosition);
        outColor = atlasColor * textColor;
    }
`.trim()
