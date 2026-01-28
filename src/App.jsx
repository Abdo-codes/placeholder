import { useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#cccccc')
  const [bgColor2, setBgColor2] = useState('#999999')
  const [textColor, setTextColor] = useState('#666666')
  const [text, setText] = useState('')
  const [format, setFormat] = useState('png')
  const [pattern, setPattern] = useState('solid')
  const [borderRadius, setBorderRadius] = useState(0)
  const [borderWidth, setBorderWidth] = useState(0)
  const [borderColor, setBorderColor] = useState('#333333')
  const [aspectLocked, setAspectLocked] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(800 / 600)
  const [batchSizes, setBatchSizes] = useState([
    { w: 1920, h: 1080, enabled: false },
    { w: 1280, h: 720, enabled: false },
    { w: 800, h: 600, enabled: false },
    { w: 400, h: 300, enabled: false },
  ])
  const canvasRef = useRef(null)

  const drawPattern = (ctx, w, h, patternType, color1, color2) => {
    switch (patternType) {
      case 'stripes':
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = color2
        ctx.lineWidth = Math.max(w, h) / 20
        for (let i = -h; i < w + h; i += ctx.lineWidth * 2) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i + h, h)
          ctx.stroke()
        }
        break
      case 'dots':
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = color2
        const dotSize = Math.max(w, h) / 40
        const spacing = dotSize * 3
        for (let x = spacing; x < w; x += spacing) {
          for (let y = spacing; y < h; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, dotSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
      case 'grid':
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = color2
        ctx.lineWidth = 1
        const gridSize = Math.max(w, h) / 10
        for (let x = 0; x <= w; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
        }
        for (let y = 0; y <= h; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
        break
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, w, h)
        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
        break
      case 'radial':
        const radialGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) / 2)
        radialGradient.addColorStop(0, color1)
        radialGradient.addColorStop(1, color2)
        ctx.fillStyle = radialGradient
        ctx.fillRect(0, 0, w, h)
        break
      case 'noise':
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, w, h)
        const imageData = ctx.getImageData(0, 0, w, h)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 30
          data[i] = Math.min(255, Math.max(0, data[i] + noise))
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
        }
        ctx.putImageData(imageData, 0, 0)
        break
      default:
        ctx.fillStyle = color1
        ctx.fillRect(0, 0, w, h)
    }
  }

  const generateImage = useCallback((customWidth, customHeight) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const w = customWidth || width
    const h = customHeight || height

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.clearRect(0, 0, w, h)

    // Draw rounded rectangle clip if needed
    if (borderRadius > 0) {
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, borderRadius)
      ctx.clip()
    }

    // Draw pattern background
    drawPattern(ctx, w, h, pattern, bgColor, bgColor2)

    // Draw border
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor
      ctx.lineWidth = borderWidth
      if (borderRadius > 0) {
        ctx.beginPath()
        ctx.roundRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth, Math.max(0, borderRadius - borderWidth / 2))
        ctx.stroke()
      } else {
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth)
      }
    }

    // Draw text
    const displayText = text || `${w} × ${h}`
    const fontSize = Math.min(w, h) / 8
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, w / 2, h / 2)

    return canvas
  }, [width, height, bgColor, bgColor2, textColor, text, pattern, borderRadius, borderWidth, borderColor])

  const generateSvg = (customWidth, customHeight) => {
    const w = customWidth || width
    const h = customHeight || height
    const displayText = text || `${w} × ${h}`
    const fontSize = Math.min(w, h) / 8

    let patternDef = ''
    let fillAttr = bgColor

    if (pattern === 'gradient') {
      patternDef = `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${bgColor}"/><stop offset="100%" style="stop-color:${bgColor2}"/></linearGradient></defs>`
      fillAttr = 'url(#grad)'
    } else if (pattern === 'radial') {
      patternDef = `<defs><radialGradient id="grad"><stop offset="0%" style="stop-color:${bgColor}"/><stop offset="100%" style="stop-color:${bgColor2}"/></radialGradient></defs>`
      fillAttr = 'url(#grad)'
    }

    const borderAttr = borderWidth > 0 ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : ''
    const rx = borderRadius > 0 ? `rx="${borderRadius}"` : ''

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${patternDef}
  <rect width="${w}" height="${h}" fill="${fillAttr}" ${rx} ${borderAttr}/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}">${displayText}</text>
</svg>`
  }

  const handleWidthChange = (newWidth) => {
    const w = Math.max(1, parseInt(newWidth) || 1)
    setWidth(w)
    if (aspectLocked) {
      setHeight(Math.round(w / aspectRatio))
    }
  }

  const handleHeightChange = (newHeight) => {
    const h = Math.max(1, parseInt(newHeight) || 1)
    setHeight(h)
    if (aspectLocked) {
      setWidth(Math.round(h * aspectRatio))
    }
  }

  const toggleAspectLock = () => {
    if (!aspectLocked) {
      setAspectRatio(width / height)
    }
    setAspectLocked(!aspectLocked)
  }

  const handleDownload = (customWidth, customHeight, customFormat) => {
    const w = customWidth || width
    const h = customHeight || height
    const fmt = customFormat || format

    if (fmt === 'svg') {
      const svg = generateSvg(w, h)
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.download = `placeholder-${w}x${h}.svg`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    } else {
      const canvas = generateImage(w, h)
      if (!canvas) return
      const mimeType = fmt === 'jpg' ? 'image/jpeg' : 'image/png'
      const link = document.createElement('a')
      link.download = `placeholder-${w}x${h}.${fmt}`
      link.href = canvas.toDataURL(mimeType, 0.9)
      link.click()
    }
  }

  const handleBatchDownload = () => {
    const enabledSizes = batchSizes.filter(s => s.enabled)
    if (enabledSizes.length === 0) {
      alert('Select at least one size for batch download')
      return
    }
    enabledSizes.forEach((size, index) => {
      setTimeout(() => {
        handleDownload(size.w, size.h, format)
      }, index * 200)
    })
  }

  const handleCopyDataUrl = async () => {
    if (format === 'svg') {
      const svg = generateSvg()
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`
      await navigator.clipboard.writeText(dataUrl)
      alert('SVG Data URL copied to clipboard!')
      return
    }

    const canvas = generateImage()
    if (!canvas) return

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const dataUrl = canvas.toDataURL(mimeType, 0.9)

    try {
      await navigator.clipboard.writeText(dataUrl)
      alert('Data URL copied to clipboard!')
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = dataUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Data URL copied to clipboard!')
    }
  }

  const handleCopyImage = async () => {
    const canvas = generateImage()
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('Image copied to clipboard!')
      }, 'image/png')
    } catch (err) {
      alert('Could not copy image. Try downloading instead.')
    }
  }

  const getPreviewDataUrl = () => {
    const canvas = generateImage()
    if (!canvas) return ''
    return canvas.toDataURL('image/png')
  }

  const toggleBatchSize = (index) => {
    const newSizes = [...batchSizes]
    newSizes[index].enabled = !newSizes[index].enabled
    setBatchSizes(newSizes)
  }

  const addCustomBatchSize = () => {
    setBatchSizes([...batchSizes, { w: width, h: height, enabled: true }])
  }

  const removeBatchSize = (index) => {
    const newSizes = batchSizes.filter((_, i) => i !== index)
    setBatchSizes(newSizes)
  }

  const presets = [
    { name: 'Square', w: 500, h: 500 },
    { name: 'HD', w: 1280, h: 720 },
    { name: 'Full HD', w: 1920, h: 1080 },
    { name: 'Instagram Post', w: 1080, h: 1080 },
    { name: 'Instagram Story', w: 1080, h: 1920 },
    { name: 'Twitter Header', w: 1500, h: 500 },
    { name: 'Facebook Cover', w: 820, h: 312 },
    { name: 'YouTube Thumbnail', w: 1280, h: 720 },
    { name: 'Open Graph', w: 1200, h: 630 },
  ]

  const patterns = [
    { id: 'solid', name: 'Solid' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'radial', name: 'Radial' },
    { id: 'stripes', name: 'Stripes' },
    { id: 'dots', name: 'Dots' },
    { id: 'grid', name: 'Grid' },
    { id: 'noise', name: 'Noise' },
  ]

  return (
    <div className="container">
      <h1>Placeholder Image Generator</h1>
      <p className="subtitle">Generate custom placeholder images with your desired dimensions</p>

      <div className="main-content">
        <div className="controls">
          <div className="input-group">
            <label>Dimensions</label>
            <div className="dimension-inputs">
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                min="1"
                max="4096"
                placeholder="Width"
              />
              <button
                className={`aspect-lock-btn ${aspectLocked ? 'locked' : ''}`}
                onClick={toggleAspectLock}
                title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {aspectLocked ? '🔒' : '🔓'}
              </button>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                min="1"
                max="4096"
                placeholder="Height"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Presets</label>
            <div className="presets">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  className="preset-btn"
                  onClick={() => {
                    setWidth(preset.w)
                    setHeight(preset.h)
                    setAspectRatio(preset.w / preset.h)
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Pattern</label>
            <div className="pattern-buttons">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  className={`pattern-btn ${pattern === p.id ? 'active' : ''}`}
                  onClick={() => setPattern(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Colors</label>
            <div className="color-inputs">
              <div className="color-input">
                <span>{pattern === 'solid' || pattern === 'noise' ? 'Background' : 'Color 1'}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#cccccc"
                />
              </div>
              {pattern !== 'solid' && pattern !== 'noise' && (
                <div className="color-input">
                  <span>Color 2</span>
                  <input
                    type="color"
                    value={bgColor2}
                    onChange={(e) => setBgColor2(e.target.value)}
                  />
                  <input
                    type="text"
                    value={bgColor2}
                    onChange={(e) => setBgColor2(e.target.value)}
                    placeholder="#999999"
                  />
                </div>
              )}
              <div className="color-input">
                <span>Text</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#666666"
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Border</label>
            <div className="border-inputs">
              <div className="border-input">
                <span>Radius</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                />
                <span className="value">{borderRadius}px</span>
              </div>
              <div className="border-input">
                <span>Width</span>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                />
                <span className="value">{borderWidth}px</span>
              </div>
              {borderWidth > 0 && (
                <div className="color-input">
                  <span>Color</span>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    placeholder="#333333"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="input-group">
            <label>Custom Text (optional)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`${width} × ${height}`}
              className="text-input"
            />
          </div>

          <div className="input-group">
            <label>Format</label>
            <div className="format-buttons">
              <button
                className={`format-btn ${format === 'png' ? 'active' : ''}`}
                onClick={() => setFormat('png')}
              >
                PNG
              </button>
              <button
                className={`format-btn ${format === 'jpg' ? 'active' : ''}`}
                onClick={() => setFormat('jpg')}
              >
                JPG
              </button>
              <button
                className={`format-btn ${format === 'svg' ? 'active' : ''}`}
                onClick={() => setFormat('svg')}
              >
                SVG
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Batch Download</label>
            <div className="batch-sizes">
              {batchSizes.map((size, index) => (
                <div key={index} className="batch-size-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={size.enabled}
                      onChange={() => toggleBatchSize(index)}
                    />
                    {size.w} × {size.h}
                  </label>
                  <button
                    className="remove-batch-btn"
                    onClick={() => removeBatchSize(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button className="add-batch-btn" onClick={addCustomBatchSize}>
                + Add Current Size
              </button>
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={() => handleDownload()}>
              Download Image
            </button>
            <button className="btn primary" onClick={handleBatchDownload}>
              Batch Download
            </button>
            <button className="btn secondary" onClick={handleCopyImage}>
              Copy Image
            </button>
            <button className="btn secondary" onClick={handleCopyDataUrl}>
              Copy Data URL
            </button>
          </div>
        </div>

        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-container">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <img
              src={getPreviewDataUrl()}
              alt="Preview"
              className="preview-image"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: borderRadius > 0 ? `${Math.min(borderRadius, 20)}px` : undefined
              }}
            />
          </div>
          <p className="preview-info">
            {width} × {height} pixels
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
