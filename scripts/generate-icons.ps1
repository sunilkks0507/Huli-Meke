Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param (
        [int]$size,
        [string]$outPath
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background: Terracotta #8C3B1E
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#8C3B1E'))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Stone board circle #D9CBB0
    $stoneBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#D9CBB0'))
    $stonePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#B9A98A'), ($size * 0.02))
    $stoneMargin = $size * 0.08
    $stoneSize = $size - (2 * $stoneMargin)
    $g.FillEllipse($stoneBrush, $stoneMargin, $stoneMargin, $stoneSize, $stoneSize)
    $g.DrawEllipse($stonePen, $stoneMargin, $stoneMargin, $stoneSize, $stoneSize)

    # Grid Lines #5A4630
    $linePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#5A4630'), [Math]::Max(2, ($size * 0.015)))
    $cx = $size / 2
    $topY = $size * 0.22
    $midY = $size * 0.50
    $botY = $size * 0.76
    $leftX = $size * 0.22
    $rightX = $size * 0.78
    $midLeftX = $size * 0.35
    $midRightX = $size * 0.65

    # Triangle
    $g.DrawLine($linePen, $cx, $topY, $leftX, $botY)
    $g.DrawLine($linePen, $leftX, $botY, $rightX, $botY)
    $g.DrawLine($linePen, $rightX, $botY, $cx, $topY)
    $g.DrawLine($linePen, $cx, $topY, $cx, $botY)
    $g.DrawLine($linePen, $midLeftX, $midY, $midRightX, $midY)

    # Tiger Piece (Apex)
    $tigerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#C2410C'))
    $tigerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, ($size * 0.015)))
    $tr = $size * 0.11
    $g.FillEllipse($tigerBrush, ($cx - $tr), ($topY + ($size * 0.06) - $tr), ($tr * 2), ($tr * 2))
    $g.DrawEllipse($tigerPen, ($cx - $tr), ($topY + ($size * 0.06) - $tr), ($tr * 2), ($tr * 2))

    # Tiger text 'T'
    $fontTiger = New-Object System.Drawing.Font('Segoe UI', ($size * 0.12), [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString('T', $fontTiger, $whiteBrush, $cx, ($topY + ($size * 0.06)), $sf)

    # Goat Pieces (Base)
    $goatBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#F5F0E6'))
    $goatPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#5A4630'), [Math]::Max(1.5, ($size * 0.012)))
    $gr = $size * 0.085
    $fontGoat = New-Object System.Drawing.Font('Segoe UI', ($size * 0.09), [System.Drawing.FontStyle]::Bold)
    $brownBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#5A4630'))

    # Left Goat
    $g.FillEllipse($goatBrush, ($midLeftX - $gr), ($botY - ($size * 0.02) - $gr), ($gr * 2), ($gr * 2))
    $g.DrawEllipse($goatPen, ($midLeftX - $gr), ($botY - ($size * 0.02) - $gr), ($gr * 2), ($gr * 2))
    $g.DrawString('G', $fontGoat, $brownBrush, $midLeftX, ($botY - ($size * 0.02)), $sf)

    # Right Goat
    $g.FillEllipse($goatBrush, ($midRightX - $gr), ($botY - ($size * 0.02) - $gr), ($gr * 2), ($gr * 2))
    $g.DrawEllipse($goatPen, ($midRightX - $gr), ($botY - ($size * 0.02) - $gr), ($gr * 2), ($gr * 2))
    $g.DrawString('G', $fontGoat, $brownBrush, $midRightX, ($botY - ($size * 0.02)), $sf)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outPath"
}

Generate-Icon -size 192 -outPath 'src/icons/icon-192.png'
Generate-Icon -size 512 -outPath 'src/icons/icon-512.png'
