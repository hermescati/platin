package dev.platin.glass

internal const val MAX_SHAPES = 4

internal const val GLASS_SHADER = """
uniform shader content;
uniform float2 size;
uniform float4 shapes[4];
uniform float shapeCount;
uniform float radius;
uniform float blend;
uniform float bezel;
uniform float refraction;
uniform float direction;
uniform float directionY;
uniform float falloff;
uniform float dispersion;
uniform float magnify;
uniform float saturation;
uniform float adaptive;
uniform float dim;
uniform float2 light;
uniform float specular;
uniform float highlightWidth;
uniform float edgeSharp;
uniform float edgeSoft;
uniform float sharpWidth;
uniform float softWidth;
uniform float2 glowCenter;
uniform float glowSpread;
uniform float glowStrength;
uniform float shadowRadius;
uniform float shadowOffset;
uniform float pinch;
uniform float pinchWidth;
uniform float pinchSpread;
uniform float rimPrism;
uniform float pinchLeft;
uniform float pinchRight;
uniform float sampleMaxX;
uniform float ellipse;
uniform float4 clipRect;
uniform float2 clipScale;
uniform float clipSoft;
uniform float clipOn;
layout(color) uniform half4 tint;
layout(color) uniform half4 rim;
layout(color) uniform half4 shadow;

float capsule(float2 p, float4 rect) {
  float2 center = (rect.xy + rect.zw) * 0.5;
  float2 extent = max((rect.zw - rect.xy) * 0.5, float2(0.0));
  float r = min(extent.x, extent.y);
  if (radius > 0.0) {
    r = min(r, radius);
  }
  float2 q = abs(p - center) - extent + float2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, float2(0.0))) - r;
}

float smoothUnion(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / max(k, 0.0001);
  return min(a, b) - h * h * k * 0.25;
}

float oval(float2 p, float4 rect) {
  float2 center = (rect.xy + rect.zw) * 0.5;
  float2 extent = max((rect.zw - rect.xy) * 0.5, float2(1.0));
  float2 q = p - center;
  float k0 = length(q / extent);
  float k1 = length(q / (extent * extent));
  return k0 * (k0 - 1.0) / max(k1, 0.0001);
}

float stadium(float2 p, float4 rect) {
  float2 center = (rect.xy + rect.zw) * 0.5;
  float2 extent = max((rect.zw - rect.xy) * 0.5, float2(0.0));
  float r = min(extent.x, extent.y);
  float2 q = abs(p - center) - extent + float2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, float2(0.0))) - r;
}

float field(float2 p) {
  float d = 100000.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) < shapeCount) {
      float shape = capsule(p, shapes[i]);
      if (i == 0 && ellipse > 0.0) {
        shape = mix(shape, oval(p, shapes[i]), ellipse);
      }
      d = smoothUnion(d, shape, blend);
    }
  }
  if (clipOn > 0.0) {
    float2 q = (p - size * 0.5) * clipScale;
    float wall = stadium(q, clipRect) / max(min(clipScale.x, clipScale.y), 0.01);
    float clipped = -smoothUnion(-d, -wall, clipSoft);
    d = mix(d, clipped, clipOn);
  }
  return d;
}

float luma(float3 c) {
  return dot(c, float3(0.2126, 0.7152, 0.0722));
}

half4 main(float2 coord) {
  float d = field(coord);
  float cover = clamp(0.5 - d, 0.0, 1.0);

  float4 outer = float4(0.0);
  float4 shadowColor = float4(shadow);
  if (shadowColor.a > 0.0) {
    float ds = max(field(coord - float2(0.0, shadowOffset)), 0.0);
    float decay = exp(-ds / max(shadowRadius, 1.0));
    float alpha = shadowColor.a * decay * decay * (1.0 - cover);
    outer = float4(shadowColor.rgb * alpha, alpha);
  }
  if (cover <= 0.004) {
    return half4(outer);
  }

  float2 n = float2(field(coord + float2(1.0, 0.0)) - field(coord - float2(1.0, 0.0)),
                    field(coord + float2(0.0, 1.0)) - field(coord - float2(0.0, 1.0)));
  float len = length(n);
  n = len > 0.0001 ? n / len : float2(0.0, -1.0);

  float depth = max(-d, 0.0);
  float t = clamp(depth / max(bezel, 1.0), 0.0, 1.0);
  float slope;
  if (falloff > 0.001) {
    float tail = pow(5.0, -falloff);
    slope = (pow(1.0 + 4.0 * t, -falloff) - tail) / (1.0 - tail);
  } else {
    slope = (1.0 - t) * (1.0 - t);
  }

  float2 middle = size * 0.5;
  float2 base = middle + (coord - middle) / (1.0 + magnify);
  float2 pinchVec = float2(0.0);
  float pinchSide = n.x < 0.0 ? pinchLeft : pinchRight;
  if (pinch > 0.0 || pinchSide > 0.0) {
    float pinchFade = 1.0 - clamp(depth / max(pinchWidth, 1.0), 0.0, 1.0);
    float ny2 = n.y * n.y;
    float2 vertical = float2(0.0, n.y * ny2 * ny2 * ny2 * pinch);
    float sideAmount = clamp(pinchSide / max(pinch, 1.0), 0.0, 1.0) * smoothstep(0.0, 0.35, abs(n.x));
    pinchVec = mix(vertical, n * pinch, sideAmount) * pinchFade;
  }
  base += pinchVec;
  float2 offset = n * float2(direction, directionY) * (slope * refraction);
  float2 lo = float2(0.5);
  float2 hi = float2(sampleMaxX > 0.0 ? min(size.x, sampleMaxX) : size.x, size.y) - float2(0.5);
  float3 col;
  float3 centre = content.eval(clamp(base + offset, lo, hi)).rgb;
  float spread = dispersion * slope * smoothstep(0.02, 0.12, luma(centre));
  float pinchSplit = length(pinchVec) * pinchSpread;
  if (spread > 0.01 || pinchSplit > 0.05) {
    float3 sum = float3(0.0);
    float3 weight = float3(0.0);
    for (int i = 0; i < 8; i++) {
      float s = (float(i) + 0.5) / 8.0;
      float3 w = float3(1.0 - s, 1.0 - abs(2.0 * s - 1.0), s);
      w = w * w;
      float k = 2.0 * s - 1.0;
      float2 uv = clamp(base + offset * (1.0 - spread * k) - pinchVec * (pinchSpread * k), lo, hi);
      sum += content.eval(uv).rgb * w;
      weight += w;
    }
    col = sum / weight;
  } else {
    col = centre;
  }

  float lum = luma(col);
  if (saturation <= 1.0) {
    col = mix(float3(lum), col, saturation);
  } else {
    float chroma = max(col.r, max(col.g, col.b)) - min(col.r, min(col.g, col.b));
    float room = 1.0 - smoothstep(0.2, 0.85, chroma);
    float guard = 1.0 - smoothstep(0.75, 0.98, lum);
    float amount = 1.0 + (saturation - 1.0) * mix(0.3, 1.0, room * guard);
    col = clamp(mix(float3(lum), col, amount), float3(0.0), float3(1.0));
  }

  float4 tintColor = float4(tint);
  col = mix(col, tintColor.rgb, tintColor.a);
  if (adaptive > 0.0) {
    float e = smoothstep(0.35, 0.75, luma(col));
    col = mix(col, mix(col, float3(1.0 - e), 0.14 + 0.08 * e), adaptive);
  }
  col *= 1.0 - dim;
  if (glowStrength > 0.0) {
    float2 gd = (coord - glowCenter) / max(glowSpread, 1.0);
    float glowMask = shapeCount > 1.5 ? clamp(0.5 - capsule(coord, shapes[0]), 0.0, 1.0) : 1.0;
    col += float3(glowStrength * exp(-0.5 * dot(gd, gd)) * glowMask);
  }

  float facingY = n.y * n.y;
  float shadeDepth = edgeSharp < 0.0 ? max(depth - 1.5, 0.0) : depth;
  col += float3((edgeSharp * exp(-shadeDepth / max(sharpWidth, 0.1)) + edgeSoft * exp(-shadeDepth / max(softWidth, 0.1))) * facingY);
  col = clamp(col, float3(0.0), float3(1.0));

  float facing = dot(n, -light);
  float lead = pow(max(facing, 0.0), 4.5);
  float trail = pow(max(-facing, 0.0), 4.5);
  float band = clamp(bezel * 0.3, 2.0, highlightWidth);
  float glowIn = clamp((depth - 1.0) / 2.0, 0.0, 1.0);
  float glow = glowIn * pow(clamp(1.0 - (depth - 3.0) / band, 0.0, 1.0), 1.5) * cover;
  float hair = clamp(1.0 - abs(d + 1.0) / 2.0, 0.0, 1.0) * cover;
  if (rimPrism > 0.0) {
    float hue = 0.33 + depth * 0.09;
    float3 spectrum = 0.5 + 0.5 * cos(6.2832 * (hue + float3(0.0, 0.33, 0.67)));
    float diagonal = 4.0 * n.x * n.x * n.y * n.y;
    float band = exp(-depth / 3.0) * cover * diagonal * diagonal;
    col += (spectrum - 0.5) * band * rimPrism;
  }
  float4 rimColor = float4(rim);
  col = mix(col, rimColor.rgb, rimColor.a * hair);
  col += float3((hair * 0.7 * (lead + trail) + glow * 0.1 * lead) * specular);
  col = clamp(col, float3(0.0), float3(1.0));
  return half4(float4(col * cover, cover) + outer);
}
"""
