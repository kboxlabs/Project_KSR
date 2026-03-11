$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets\textures'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Canvas($w, $h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  return @{ Bitmap = $bmp; Graphics = $gfx }
}

function Fill-PixelRect($gfx, $colorHex, $x, $y, $w, $h) {
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($colorHex))
  $gfx.FillRectangle($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Save-Png($bmp, $path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-Rects($name, $width, $height, $rects) {
  $canvas = New-Canvas $width $height
  foreach ($r in $rects) {
    Fill-PixelRect $canvas.Graphics $r.color $r.x $r.y $r.w $r.h
  }
  Save-Png $canvas.Bitmap (Join-Path $outDir $name)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

Draw-Rects 'wall_mildew_a.png' 128 128 @(
  @{ color='#334038'; x=0; y=0; w=128; h=128 }
  @{ color='#455248'; x=0; y=0; w=128; h=8 }
  @{ color='#455248'; x=0; y=120; w=128; h=8 }
  @{ color='#455248'; x=0; y=0; w=8; h=128 }
  @{ color='#455248'; x=120; y=0; w=8; h=128 }
  @{ color='#273129'; x=16; y=16; w=32; h=24 }
  @{ color='#596d56'; x=56; y=16; w=48; h=16 }
  @{ color='#4f6350'; x=24; y=48; w=40; h=24 }
  @{ color='#243027'; x=72; y=40; w=32; h=32 }
  @{ color='#5e735d'; x=16; y=80; w=24; h=24 }
  @{ color='#2b352d'; x=48; y=80; w=48; h=24 }
  @{ color='#6a7f67'; x=96; y=88; w=16; h=16 }
  @{ color='#738a6d'; x=32; y=32; w=8; h=8 }
  @{ color='#738a6d'; x=80; y=56; w=8; h=8 }
  @{ color='#4b5e49'; x=56; y=96; w=16; h=8 }
)

Draw-Rects 'wall_mildew_b.png' 128 128 @(
  @{ color='#334038'; x=0; y=0; w=128; h=128 }
  @{ color='#455248'; x=0; y=0; w=128; h=8 }
  @{ color='#455248'; x=0; y=120; w=128; h=8 }
  @{ color='#455248'; x=0; y=0; w=8; h=128 }
  @{ color='#455248'; x=120; y=0; w=8; h=128 }
  @{ color='#5e715b'; x=16; y=16; w=40; h=16 }
  @{ color='#253027'; x=64; y=16; w=32; h=24 }
  @{ color='#2c372e'; x=32; y=40; w=24; h=32 }
  @{ color='#61755f'; x=64; y=48; w=40; h=24 }
  @{ color='#263127'; x=16; y=80; w=32; h=16 }
  @{ color='#4c5f4a'; x=56; y=80; w=40; h=24 }
  @{ color='#70856c'; x=24; y=104; w=64; h=8 }
  @{ color='#7c936f'; x=40; y=24; w=8; h=8 }
  @{ color='#7c936f'; x=80; y=64; w=8; h=8 }
  @{ color='#62775f'; x=72; y=96; w=16; h=8 }
)

Draw-Rects 'wall_mildew_c.png' 128 128 @(
  @{ color='#334038'; x=0; y=0; w=128; h=128 }
  @{ color='#455248'; x=0; y=0; w=128; h=8 }
  @{ color='#455248'; x=0; y=120; w=128; h=8 }
  @{ color='#455248'; x=0; y=0; w=8; h=128 }
  @{ color='#455248'; x=120; y=0; w=8; h=128 }
  @{ color='#283228'; x=16; y=16; w=24; h=24 }
  @{ color='#6c8168'; x=48; y=16; w=48; h=16 }
  @{ color='#5a6f58'; x=24; y=48; w=32; h=16 }
  @{ color='#223024'; x=64; y=40; w=40; h=32 }
  @{ color='#627760'; x=16; y=72; w=16; h=32 }
  @{ color='#2d382f'; x=40; y=80; w=32; h=16 }
  @{ color='#4b5d49'; x=80; y=80; w=24; h=24 }
  @{ color='#768c72'; x=48; y=104; w=40; h=8 }
  @{ color='#8aa184'; x=72; y=24; w=8; h=8 }
  @{ color='#6f866c'; x=88; y=88; w=8; h=8 }
)

Draw-Rects 'floor_flagstone_a.png' 128 128 @(
  @{ color='#3d433c'; x=0; y=0; w=128; h=128 }
  @{ color='#4f574f'; x=0; y=0; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=120; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=0; w=8; h=128 }
  @{ color='#4f574f'; x=120; y=0; w=8; h=128 }
  @{ color='#525c52'; x=16; y=16; w=40; h=32 }
  @{ color='#30362f'; x=64; y=16; w=40; h=24 }
  @{ color='#66705f'; x=24; y=56; w=32; h=24 }
  @{ color='#454d44'; x=64; y=48; w=32; h=32 }
  @{ color='#2e352e'; x=16; y=88; w=40; h=16 }
  @{ color='#596359'; x=64; y=88; w=32; h=16 }
  @{ color='#79836f'; x=40; y=32; w=8; h=8 }
  @{ color='#6a7365'; x=80; y=64; w=8; h=8 }
)

Draw-Rects 'floor_flagstone_b.png' 128 128 @(
  @{ color='#3d433c'; x=0; y=0; w=128; h=128 }
  @{ color='#4f574f'; x=0; y=0; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=120; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=0; w=8; h=128 }
  @{ color='#4f574f'; x=120; y=0; w=8; h=128 }
  @{ color='#2f362f'; x=16; y=16; w=32; h=24 }
  @{ color='#59635a'; x=56; y=16; w=48; h=32 }
  @{ color='#697565'; x=24; y=48; w=40; h=16 }
  @{ color='#333a33'; x=72; y=56; w=24; h=24 }
  @{ color='#485149'; x=16; y=80; w=32; h=24 }
  @{ color='#616b60'; x=56; y=88; w=40; h=16 }
  @{ color='#7c8778'; x=80; y=32; w=8; h=8 }
  @{ color='#5f685c'; x=32; y=88; w=8; h=8 }
)

Draw-Rects 'floor_flagstone_c.png' 128 128 @(
  @{ color='#3d433c'; x=0; y=0; w=128; h=128 }
  @{ color='#4f574f'; x=0; y=0; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=120; w=128; h=8 }
  @{ color='#4f574f'; x=0; y=0; w=8; h=128 }
  @{ color='#4f574f'; x=120; y=0; w=8; h=128 }
  @{ color='#566056'; x=16; y=16; w=48; h=16 }
  @{ color='#303730'; x=72; y=16; w=24; h=32 }
  @{ color='#475048'; x=24; y=40; w=32; h=32 }
  @{ color='#697466'; x=64; y=56; w=40; h=16 }
  @{ color='#313831'; x=16; y=80; w=24; h=16 }
  @{ color='#596259'; x=48; y=80; w=48; h=24 }
  @{ color='#818c7b'; x=80; y=64; w=8; h=8 }
  @{ color='#616a60'; x=32; y=48; w=8; h=8 }
)

Draw-Rects 'player_rogue_sprite.png' 128 192 @(
  @{ color='#00000000'; x=0; y=0; w=128; h=192 }
  @{ color='#1b1c22'; x=48; y=8; w=32; h=8 }
  @{ color='#272a35'; x=40; y=16; w=48; h=16 }
  @{ color='#34394a'; x=32; y=32; w=64; h=24 }
  @{ color='#c9b59a'; x=40; y=40; w=16; h=8 }
  @{ color='#c9b59a'; x=72; y=40; w=16; h=8 }
  @{ color='#1d2028'; x=48; y=56; w=32; h=16 }
  @{ color='#4e5a32'; x=40; y=72; w=48; h=32 }
  @{ color='#2a2f3d'; x=32; y=80; w=8; h=40 }
  @{ color='#2a2f3d'; x=88; y=80; w=8; h=40 }
  @{ color='#2a313f'; x=24; y=96; w=80; h=40 }
  @{ color='#1e2430'; x=16; y=104; w=16; h=48 }
  @{ color='#1e2430'; x=96; y=104; w=16; h=48 }
  @{ color='#7b4b35'; x=56; y=104; w=16; h=32 }
  @{ color='#a8adb7'; x=88; y=64; w=8; h=48 }
  @{ color='#d6d9df'; x=96; y=64; w=8; h=40 }
  @{ color='#3f2d20'; x=48; y=136; w=16; h=32 }
  @{ color='#473224'; x=64; y=136; w=16; h=32 }
  @{ color='#181a1f'; x=40; y=168; w=16; h=16 }
  @{ color='#181a1f'; x=72; y=168; w=16; h=16 }
  @{ color='#4b5163'; x=48; y=24; w=32; h=8 }
  @{ color='#394252'; x=32; y=120; w=16; h=8 }
  @{ color='#394252'; x=80; y=120; w=16; h=8 }
)
