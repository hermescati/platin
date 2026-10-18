package dev.questlog.glass

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.RenderEffect
import android.graphics.RuntimeShader
import android.graphics.Shader
import android.os.Build
import android.view.ViewTreeObserver
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class GlassView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  var group: String = GlassRegistry.DEFAULT_GROUP
  var shapes: FloatArray? = null
  var inset = 0f
  var cornerRadius = 0f
  var blend = 0f
  var blurRadius = 0f
  var bezel = 0f
  var refraction = 0f
  var magnify = 0f
  var glowRadius = 0f
  var rimWidth = 0f
  var shadowRadius = 0f
  var shadowOffset = 0f
  var tint: Color = TRANSPARENT
  var sheen: Color = TRANSPARENT
  var rimTop: Color = TRANSPARENT
  var rimBottom: Color = TRANSPARENT
  var glow: Color = TRANSPARENT
  var shadow: Color = TRANSPARENT

  private val density = resources.displayMetrics.density
  private val selfToGlobal = Matrix()
  private val backdropToGlobal = Matrix()
  private val backdropToSelf = Matrix()
  private val shapeBuffer = FloatArray(MAX_SHAPES * 4)
  private val shader: RuntimeShader? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) RuntimeShader(GLASS_SHADER) else null

  private val preDraw = ViewTreeObserver.OnPreDrawListener {
    invalidate()
    true
  }

  init {
    setWillNotDraw(false)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    viewTreeObserver.addOnPreDrawListener(preDraw)
  }

  override fun onDetachedFromWindow() {
    viewTreeObserver.removeOnPreDrawListener(preDraw)
    super.onDetachedFromWindow()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateEffect()
  }

  private fun fillShapes(): Int {
    val source = shapes
    if (source == null || source.size < 4) {
      val pad = inset * density
      shapeBuffer[0] = pad
      shapeBuffer[1] = pad
      shapeBuffer[2] = width - pad
      shapeBuffer[3] = height - pad
      return 1
    }
    val count = minOf(source.size / 4, MAX_SHAPES)
    for (i in 0 until count * 4) {
      shapeBuffer[i] = source[i] * density
    }
    for (i in count * 4 until shapeBuffer.size) {
      shapeBuffer[i] = 0f
    }
    return count
  }

  fun updateEffect() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val blur = if (blurRadius > 0f) {
      val radius = blurRadius * density
      RenderEffect.createBlurEffect(radius, radius, Shader.TileMode.CLAMP)
    } else {
      null
    }
    val glass = shader?.takeIf { width > 0 && height > 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU }?.let {
      val count = fillShapes()
      it.setFloatUniform("size", width.toFloat(), height.toFloat())
      it.setFloatUniform("shapes", shapeBuffer)
      it.setFloatUniform("shapeCount", count.toFloat())
      it.setFloatUniform("radius", cornerRadius * density)
      it.setFloatUniform("blend", blend * density)
      it.setFloatUniform("bezel", bezel * density)
      it.setFloatUniform("refraction", refraction * density)
      it.setFloatUniform("magnify", magnify)
      it.setFloatUniform("glowRadius", glowRadius * density)
      it.setFloatUniform("rimWidth", rimWidth * density)
      it.setFloatUniform("shadowRadius", shadowRadius * density)
      it.setFloatUniform("shadowOffset", shadowOffset * density)
      it.setColorUniform("tint", tint)
      it.setColorUniform("sheen", sheen)
      it.setColorUniform("rimTop", rimTop)
      it.setColorUniform("rimBottom", rimBottom)
      it.setColorUniform("glow", glow)
      it.setColorUniform("shadow", shadow)
      RenderEffect.createRuntimeShaderEffect(it, "content")
    }
    setRenderEffect(
      when {
        glass != null && blur != null -> RenderEffect.createChainEffect(glass, blur)
        else -> glass ?: blur
      }
    )
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || !canvas.isHardwareAccelerated) return
    val backdrop = GlassRegistry.backdrop(group) ?: return
    val node = backdrop.node ?: return
    if (!node.hasDisplayList()) return
    selfToGlobal.reset()
    transformMatrixToGlobal(selfToGlobal)
    if (!selfToGlobal.invert(backdropToSelf)) return
    backdropToGlobal.reset()
    backdrop.transformMatrixToGlobal(backdropToGlobal)
    backdropToSelf.preConcat(backdropToGlobal)
    canvas.save()
    canvas.concat(backdropToSelf)
    canvas.drawRenderNode(node)
    canvas.restore()
  }

  private companion object {
    val TRANSPARENT: Color = Color.valueOf(0f, 0f, 0f, 0f)
  }
}
