package dev.platin.glass

import android.content.Context
import android.database.ContentObserver
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.RenderEffect
import android.graphics.RuntimeShader
import android.graphics.Shader
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.ViewTreeObserver
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

class GlassView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  var group: String = GlassRegistry.DEFAULT_GROUP
  var underlay: String? = null
  var overlay: String? = null
  var shapes: FloatArray? = null
  var inset = 0f
  var cornerRadius = 0f
  var blend = 0f
  var blurRadius = 0f
  var bezel = 0f
  var refraction = 0f
  var refractOutward = false
  var refractOutwardY: Boolean? = null
  var refractionYScale = 1f
  var falloff = 0f
  var dispersion = 0f
  var magnify = 0f
  var saturation = 1f
  var adaptive = 0f
  var dim = 0f
  var lightAngle = DEFAULT_LIGHT_ANGLE
  var specular = 0f
  var highlightWidth = DEFAULT_HIGHLIGHT_WIDTH
  var edgeSharp = 0f
  var edgeSoft = 0f
  var sharpWidth = 0f
  var softWidth = 0f
  var glowX = 0f
  var glowY = 0f
  var glowSpread = 0f
  var glowStrength = 0f
  var shadowRadius = 0f
  var shadowOffset = 0f
  var pinch = 0f
  var pinchWidth = 0f
  var pinchSpread = 0f
  var rimPrism = 0f
  var pinchLeft = 0f
  var pinchRight = 0f
  var sampleMaxX = 0f
  var ellipse = 0f
  var clipLeft = 0f
  var clipTop = 0f
  var clipRight = 0f
  var clipBottom = 0f
  var clipScaleX = 1f
  var clipScaleY = 1f
  var clipSoft = 0f
  var clipOn = 0f
  var tint: Color = TRANSPARENT
  var rim: Color = TRANSPARENT
  var fallback: Color = TRANSPARENT
  var shadow: Color = TRANSPARENT

  private val density = resources.displayMetrics.density
  private val selfToGlobal = Matrix()
  private val backdropToGlobal = Matrix()
  private val backdropToSelf = Matrix()
  private val inverse = Matrix()
  private val shapeBuffer = FloatArray(MAX_SHAPES * 4)
  private val state = FloatArray(STATE_SIZE)
  private val lastState = FloatArray(STATE_SIZE) { Float.NaN }
  private var reducedTransparency = false
  private var effect: RenderEffect? = null
  private val shader: RuntimeShader? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      try {
        RuntimeShader(GLASS_SHADER)
      } catch (_: IllegalArgumentException) {
        null
      }
    } else {
      null
    }

  private val preDraw = ViewTreeObserver.OnPreDrawListener {
    invalidate()
    true
  }

  private val contrastObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
    override fun onChange(selfChange: Boolean) {
      reducedTransparency = readReducedTransparency()
      updateEffect()
    }
  }

  init {
    setWillNotDraw(false)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    viewTreeObserver.addOnPreDrawListener(preDraw)
    context.contentResolver.registerContentObserver(Settings.Secure.getUriFor(HIGH_TEXT_CONTRAST), false, contrastObserver)
    reducedTransparency = readReducedTransparency()
    updateEffect()
  }

  override fun onDetachedFromWindow() {
    viewTreeObserver.removeOnPreDrawListener(preDraw)
    context.contentResolver.unregisterContentObserver(contrastObserver)
    super.onDetachedFromWindow()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateEffect()
  }

  private fun readReducedTransparency(): Boolean =
    try {
      Settings.Secure.getInt(context.contentResolver, HIGH_TEXT_CONTRAST, 0) == 1
    } catch (_: Exception) {
      false
    }

  private fun quantize(value: Float): Float = (value * SHAPE_STEPS).roundToInt() / SHAPE_STEPS

  private fun fillShapes(): Int {
    val source = shapes
    if (source == null || source.size < 4) {
      val pad = inset * density
      shapeBuffer[0] = pad
      shapeBuffer[1] = pad
      shapeBuffer[2] = width - pad
      shapeBuffer[3] = height - pad
      for (i in 4 until shapeBuffer.size) {
        shapeBuffer[i] = 0f
      }
      return 1
    }
    val count = minOf(source.size / 4, MAX_SHAPES)
    for (i in 0 until count * 4) {
      shapeBuffer[i] = quantize(source[i] * density)
    }
    for (i in count * 4 until shapeBuffer.size) {
      shapeBuffer[i] = 0f
    }
    return count
  }

  private fun shortestSide(count: Int): Float {
    var side = Float.MAX_VALUE
    for (i in 0 until count) {
      val w = shapeBuffer[i * 4 + 2] - shapeBuffer[i * 4]
      val h = shapeBuffer[i * 4 + 3] - shapeBuffer[i * 4 + 1]
      if (w > 0f && h > 0f) side = min(side, min(w, h))
    }
    return if (side == Float.MAX_VALUE) 0f else side
  }

  private fun blur(radiusPx: Float): RenderEffect? =
    if (radiusPx > 0f) RenderEffect.createBlurEffect(radiusPx, radiusPx, Shader.TileMode.CLAMP) else null

  private fun putColor(index: Int, color: Color): Int {
    state[index] = color.red()
    state[index + 1] = color.green()
    state[index + 2] = color.blue()
    state[index + 3] = color.alpha()
    return index + 4
  }

  fun updateEffect() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val opaque = reducedTransparency && fallback.alpha() > 0f
    val blurPx = if (opaque) 0f else blurRadius * density
    val glassShader = shader?.takeIf { width > 0 && height > 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU }

    if (glassShader == null) {
      state.fill(0f)
      state[0] = blurPx
      if (!state.contentEquals(lastState)) {
        effect = blur(blurPx)
        state.copyInto(lastState)
      }
      setRenderEffect(effect)
      return
    }

    val count = fillShapes()
    val side = shortestSide(count)
    val reference = REFERENCE_SIDE * density
    val bezelPx = min(bezel * density, side * BEZEL_RATIO).coerceAtLeast(MIN_BAND)
    val refractionPx = if (opaque) 0f else min(refraction * density, side * REFRACTION_RATIO * min(1f, side / reference))
    val highlightPx = min(highlightWidth * density, side * HIGHLIGHT_RATIO).coerceAtLeast(MIN_BAND)
    val angle = Math.toRadians(lightAngle.toDouble())

    var i = 0
    state[i++] = blurPx
    state[i++] = width.toFloat()
    state[i++] = height.toFloat()
    shapeBuffer.copyInto(state, i)
    i += shapeBuffer.size
    state[i++] = count.toFloat()
    state[i++] = cornerRadius * density
    state[i++] = blend * density
    state[i++] = bezelPx
    state[i++] = refractionPx
    state[i++] = if (refractOutward) 1f else -1f
    state[i++] = (if (refractOutwardY ?: refractOutward) 1f else -1f) * refractionYScale
    state[i++] = falloff
    state[i++] = if (opaque) 0f else dispersion
    state[i++] = if (opaque) 0f else magnify
    state[i++] = if (opaque) 1f else saturation
    state[i++] = if (opaque) 0f else adaptive
    state[i++] = if (opaque) 0f else dim
    state[i++] = cos(angle).toFloat()
    state[i++] = sin(angle).toFloat()
    state[i++] = specular
    state[i++] = highlightPx
    state[i++] = edgeSharp
    state[i++] = edgeSoft
    state[i++] = sharpWidth * density
    state[i++] = softWidth * density
    state[i++] = glowX * density
    state[i++] = glowY * density
    state[i++] = glowSpread * density
    state[i++] = if (opaque) 0f else glowStrength
    state[i++] = shadowRadius * density
    state[i++] = shadowOffset * density
    state[i++] = if (opaque) 0f else pinch * density
    state[i++] = pinchWidth * density
    state[i++] = if (opaque) 0f else pinchSpread
    state[i++] = if (opaque) 0f else rimPrism
    state[i++] = if (opaque) 0f else pinchLeft * density
    state[i++] = if (opaque) 0f else pinchRight * density
    state[i++] = sampleMaxX * density
    state[i++] = ellipse
    state[i++] = clipLeft * density
    state[i++] = clipTop * density
    state[i++] = clipRight * density
    state[i++] = clipBottom * density
    state[i++] = clipScaleX
    state[i++] = clipScaleY
    state[i++] = clipSoft * density
    state[i++] = clipOn
    i = putColor(i, if (opaque) fallback else tint)
    i = putColor(i, rim)
    putColor(i, shadow)
    if (state.contentEquals(lastState)) {
      setRenderEffect(effect)
      return
    }

    var u = 3 + shapeBuffer.size
    glassShader.setFloatUniform("size", state[1], state[2])
    glassShader.setFloatUniform("shapes", shapeBuffer)
    glassShader.setFloatUniform("shapeCount", state[u++])
    glassShader.setFloatUniform("radius", state[u++])
    glassShader.setFloatUniform("blend", state[u++])
    glassShader.setFloatUniform("bezel", state[u++])
    glassShader.setFloatUniform("refraction", state[u++])
    glassShader.setFloatUniform("direction", state[u++])
    glassShader.setFloatUniform("directionY", state[u++])
    glassShader.setFloatUniform("falloff", state[u++])
    glassShader.setFloatUniform("dispersion", state[u++])
    glassShader.setFloatUniform("magnify", state[u++])
    glassShader.setFloatUniform("saturation", state[u++])
    glassShader.setFloatUniform("adaptive", state[u++])
    glassShader.setFloatUniform("dim", state[u++])
    glassShader.setFloatUniform("light", state[u], state[u + 1])
    u += 2
    glassShader.setFloatUniform("specular", state[u++])
    glassShader.setFloatUniform("highlightWidth", state[u++])
    glassShader.setFloatUniform("edgeSharp", state[u++])
    glassShader.setFloatUniform("edgeSoft", state[u++])
    glassShader.setFloatUniform("sharpWidth", state[u++])
    glassShader.setFloatUniform("softWidth", state[u++])
    glassShader.setFloatUniform("glowCenter", state[u], state[u + 1])
    u += 2
    glassShader.setFloatUniform("glowSpread", state[u++])
    glassShader.setFloatUniform("glowStrength", state[u++])
    glassShader.setFloatUniform("shadowRadius", state[u++])
    glassShader.setFloatUniform("shadowOffset", state[u++])
    glassShader.setFloatUniform("pinch", state[u++])
    glassShader.setFloatUniform("pinchWidth", state[u++])
    glassShader.setFloatUniform("pinchSpread", state[u++])
    glassShader.setFloatUniform("rimPrism", state[u++])
    glassShader.setFloatUniform("pinchLeft", state[u++])
    glassShader.setFloatUniform("pinchRight", state[u++])
    glassShader.setFloatUniform("sampleMaxX", state[u++])
    glassShader.setFloatUniform("ellipse", state[u++])
    glassShader.setFloatUniform("clipRect", state[u], state[u + 1], state[u + 2], state[u + 3])
    u += 4
    glassShader.setFloatUniform("clipScale", state[u], state[u + 1])
    u += 2
    glassShader.setFloatUniform("clipSoft", state[u++])
    glassShader.setFloatUniform("clipOn", state[u])
    glassShader.setColorUniform("tint", if (opaque) fallback else tint)
    glassShader.setColorUniform("rim", rim)
    glassShader.setColorUniform("shadow", shadow)

    val glass = RenderEffect.createRuntimeShaderEffect(glassShader, "content")
    val inner = blur(blurPx)
    effect = if (inner != null) RenderEffect.createChainEffect(glass, inner) else glass
    state.copyInto(lastState)
    setRenderEffect(effect)
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || !canvas.isHardwareAccelerated) return
    selfToGlobal.reset()
    transformMatrixToGlobal(selfToGlobal)
    if (!selfToGlobal.invert(inverse)) return
    underlay?.let { drawBackdrop(canvas, it) }
    drawBackdrop(canvas, group)
    overlay?.let { drawBackdrop(canvas, it) }
  }

  private fun drawBackdrop(canvas: Canvas, name: String) {
    val backdrop = GlassRegistry.backdrop(name) ?: return
    val node = backdrop.node ?: return
    if (!node.hasDisplayList()) return
    backdropToGlobal.reset()
    backdrop.transformMatrixToGlobal(backdropToGlobal)
    backdropToSelf.set(inverse)
    backdropToSelf.preConcat(backdropToGlobal)
    canvas.save()
    canvas.concat(backdropToSelf)
    canvas.drawRenderNode(node)
    canvas.restore()
  }

  private companion object {
    val TRANSPARENT: Color = Color.valueOf(0f, 0f, 0f, 0f)
    const val HIGH_TEXT_CONTRAST = "high_text_contrast_enabled"
    const val DEFAULT_LIGHT_ANGLE = 30f
    const val DEFAULT_HIGHLIGHT_WIDTH = 2f
    const val SHAPE_STEPS = 4f
    const val REFERENCE_SIDE = 110f
    const val BEZEL_RATIO = 0.3f
    const val REFRACTION_RATIO = 0.7f
    const val HIGHLIGHT_RATIO = 0.05f
    const val MIN_BAND = 2f
    const val STATE_SIZE = 3 + MAX_SHAPES * 4 + 46 + 12
  }
}
