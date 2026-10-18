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
uniform float magnify;
uniform float glowRadius;
uniform float rimWidth;
uniform float shadowRadius;
uniform float shadowOffset;
layout(color) uniform half4 tint;
layout(color) uniform half4 sheen;
layout(color) uniform half4 rimTop;
layout(color) uniform half4 rimBottom;
layout(color) uniform half4 glow;
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

float field(float2 p) {
  float d = 100000.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) < shapeCount) {
      d = smoothUnion(d, capsule(p, shapes[i]), blend);
    }
  }
  return d;
}

float4 nearest(float2 p) {
  float best = 100000.0;
  float4 rect = float4(0.0, 0.0, size);
  for (int i = 0; i < 4; i++) {
    if (float(i) < shapeCount) {
      float d = capsule(p, shapes[i]);
      if (d < best) {
        best = d;
        rect = shapes[i];
      }
    }
  }
  return rect;
}

half4 main(float2 coord) {
  float d = field(coord);
  float inside = clamp(0.5 - d, 0.0, 1.0);

  float4 outer = float4(0.0);
  float4 shadowColor = float4(shadow);
  if (shadowColor.a > 0.0) {
    float ds = max(field(coord - float2(0.0, shadowOffset)), 0.0);
    float falloff = exp(-ds / max(shadowRadius, 1.0));
    float alpha = shadowColor.a * falloff * falloff * (1.0 - inside);
    outer = float4(shadowColor.rgb * alpha, alpha);
  }
  if (inside <= 0.0) {
    return half4(outer);
  }

  float2 e = float2(0.5, 0.0);
  float2 n = float2(field(coord + e.xy) - field(coord - e.xy), field(coord + e.yx) - field(coord - e.yx));
  float len = length(n);
  n = len > 0.0001 ? n / len : float2(0.0);

  float depth = max(-d, 0.0);
  float edge = 1.0 - clamp(depth / max(bezel, 1.0), 0.0, 1.0);
  float bend = refraction * (1.0 - sqrt(max(1.0 - edge * edge, 0.0)));
  float2 middle = size * 0.5;
  float2 uv = middle + (coord - middle) / (1.0 + magnify) - n * bend;
  uv = clamp(uv, float2(0.5), size - float2(0.5));
  float3 col = float3(content.eval(uv).rgb);

  float4 tintColor = float4(tint);
  col = mix(col, tintColor.rgb, tintColor.a);

  float4 rect = nearest(coord);
  float sheenT = clamp((coord.y - rect.y) / max((rect.w - rect.y) * 0.6, 1.0), 0.0, 1.0);
  float4 sheenColor = float4(sheen);
  col = mix(col, sheenColor.rgb, sheenColor.a * (1.0 - sheenT));

  float4 glowColor = float4(glow);
  col = mix(col, glowColor.rgb, glowColor.a * exp(-depth / max(glowRadius, 1.0)));

  float rim = 1.0 - clamp(depth / max(rimWidth, 0.5), 0.0, 1.0);
  float up = clamp(0.5 - n.y * 0.5, 0.0, 1.0);
  float4 rimColor = mix(float4(rimBottom), float4(rimTop), up);
  col = mix(col, rimColor.rgb, rimColor.a * rim);

  return half4(float4(col * inside, inside) + outer);
}
"""
