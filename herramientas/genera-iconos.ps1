Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue

$codigo = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class RecortaIconos
{
    // Quita el fondo claro que da al borde (deja el blanco de adentro del dibujo)
    public static int QuitarFondo(string ruta, string salida)
    {
        Bitmap orig = new Bitmap(ruta);
        int w = orig.Width, h = orig.Height;
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) g.DrawImage(orig, 0, 0, w, h);
        orig.Dispose();

        Rectangle rect = new Rectangle(0, 0, w, h);
        BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        byte[] buf = new byte[stride * h];
        Marshal.Copy(data.Scan0, buf, 0, stride * h);

        bool[] hecho = new bool[w * h];
        Stack<int> pila = new Stack<int>();
        for (int x = 0; x < w; x++) { pila.Push(x); pila.Push((h - 1) * w + x); }
        for (int y = 0; y < h; y++) { pila.Push(y * w); pila.Push(y * w + w - 1); }

        int pintados = 0;
        while (pila.Count > 0)
        {
            int p = pila.Pop();
            if (hecho[p]) continue;
            hecho[p] = true;
            int px = p % w, py = p / w;
            int i = py * stride + px * 4;
            // "claro" = fondo (blanco o gris muy claro); el dibujo oscuro/rojo no entra
            if (!(buf[i] >= 190 && buf[i + 1] >= 190 && buf[i + 2] >= 190)) continue;
            buf[i + 3] = 0;
            pintados++;
            if (px + 1 < w) pila.Push(p + 1);
            if (px - 1 >= 0) pila.Push(p - 1);
            if (py + 1 < h) pila.Push(p + w);
            if (py - 1 >= 0) pila.Push(p - w);
        }

        int grises = 0;
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                int i = y * stride + x * 4;
                if (buf[i + 3] == 0) continue;
                int mn = buf[i], mx = buf[i];
                if (buf[i + 1] < mn) mn = buf[i + 1]; if (buf[i + 1] > mx) mx = buf[i + 1];
                if (buf[i + 2] < mn) mn = buf[i + 2]; if (buf[i + 2] > mx) mx = buf[i + 2];
                if (mn >= 120 && (mx - mn) < 25) grises++;
            }
        }

        Marshal.Copy(buf, 0, data.Scan0, stride * h);
        bmp.UnlockBits(data);
        bmp.Save(salida, ImageFormat.Png);
        bmp.Dispose();
        Console.WriteLine("  fondo borrado: " + pintados + " px   |   grises que quedaron: " + grises + " px");
        return pintados;
    }

    // Cajas de cada icono (pedazos opacos separados), ordenadas: fila y luego izquierda a derecha
    public static List<Rectangle> Cajas(string ruta)
    {
        Bitmap bmp = new Bitmap(ruta);
        int w = bmp.Width, h = bmp.Height;
        Rectangle rect = new Rectangle(0, 0, w, h);
        BitmapData data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        byte[] buf = new byte[stride * h];
        Marshal.Copy(data.Scan0, buf, 0, stride * h);
        bmp.UnlockBits(data);
        bmp.Dispose();

        bool[] visto = new bool[w * h];
        List<Rectangle> cajas = new List<Rectangle>();

        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                int p0 = y * w + x;
                if (visto[p0]) continue;
                visto[p0] = true;
                if (buf[y * stride + x * 4 + 3] == 0) continue;

                Queue<int> cola = new Queue<int>();
                cola.Enqueue(p0);
                int minx = x, maxx = x, miny = y, maxy = y;
                while (cola.Count > 0)
                {
                    int p = cola.Dequeue();
                    int px = p % w, py = p / w;
                    if (px < minx) minx = px;
                    if (px > maxx) maxx = px;
                    if (py < miny) miny = py;
                    if (py > maxy) maxy = py;
                    int[] dx = { 1, -1, 0, 0 };
                    int[] dy = { 0, 0, 1, -1 };
                    for (int k = 0; k < 4; k++)
                    {
                        int nx = px + dx[k], ny = py + dy[k];
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                        int np = ny * w + nx;
                        if (visto[np]) continue;
                        visto[np] = true;
                        if (buf[ny * stride + nx * 4 + 3] > 0) cola.Enqueue(np);
                    }
                }
                cajas.Add(new Rectangle(minx, miny, maxx - minx + 1, maxy - miny + 1));
            }
        }

        cajas.Sort(delegate (Rectangle a, Rectangle b)
        {
            int centroA = a.Y + a.Height / 2, centroB = b.Y + b.Height / 2;
            if (Math.Abs(centroA - centroB) > 60) return centroA.CompareTo(centroB);
            return a.X.CompareTo(b.X);
        });
        return cajas;
    }

    // Recorta cuadrado y guarda del tamano pedido
    public static void Guardar(string ruta, Rectangle caja, int tam, string salida)
    {
        using (Bitmap orig = new Bitmap(ruta))
        {
            int lado = Math.Max(caja.Width, caja.Height) + 6;
            int cx = caja.X + caja.Width / 2;
            int cy = caja.Y + caja.Height / 2;
            int x0 = cx - lado / 2, y0 = cy - lado / 2;
            if (x0 < 0) x0 = 0;
            if (y0 < 0) y0 = 0;
            if (x0 + lado > orig.Width) x0 = orig.Width - lado;
            if (y0 + lado > orig.Height) y0 = orig.Height - lado;
            Rectangle src = new Rectangle(x0, y0, lado, lado);
            using (Bitmap destino = new Bitmap(tam, tam, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(destino))
                {
                    g.Clear(Color.Transparent);
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingMode = CompositingMode.SourceCopy;
                    g.DrawImage(orig, new Rectangle(0, 0, tam, tam), src, GraphicsUnit.Pixel);
                }
                destino.Save(salida, ImageFormat.Png);
            }
        }
    }

    // Vista previa: los iconos sobre fondo oscuro (como se ven en la app)
    public static void Preview(string[] rutas, string salida)
    {
        int grande = 110, chico = 34, sep = 14, alto = grande + chico + 60;
        int ancho = rutas.Length * (grande + sep) + sep;
        using (Bitmap bmp = new Bitmap(ancho, alto, PixelFormat.Format32bppArgb))
        {
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.Clear(Color.FromArgb(255, 18, 18, 22));
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                for (int i = 0; i < rutas.Length; i++)
                {
                    int x = sep + i * (grande + sep);
                    using (Bitmap ic = new Bitmap(rutas[i]))
                    {
                        g.DrawImage(ic, new Rectangle(x, 20, grande, grande));
                        g.DrawImage(ic, new Rectangle(x + (grande - chico) / 2, grande + 34, chico, chico));
                    }
                }
            }
            bmp.Save(salida, ImageFormat.Png);
        }
    }
}
'@

Add-Type -TypeDefinition $codigo -ReferencedAssemblies System.Drawing -Language CSharp

$origen = Join-Path $PSScriptRoot "hoja-iconos.png"
$limpio = Join-Path $PSScriptRoot "iconos-limpio.png"
$salida = "C:\strikely\assets\iconos"
$salidaMapa = "C:\strikely\assets\iconos\mapa"
$preview = Join-Path $PSScriptRoot "vista-previa.png"

$img = [System.Drawing.Image]::FromFile($origen)
"Imagen original: $($img.Width) x $($img.Height)"
$img.Dispose()

New-Item -ItemType Directory -Force -Path $salida | Out-Null
New-Item -ItemType Directory -Force -Path $salidaMapa | Out-Null

""
"--- Quitando fondo ---"
[RecortaIconos]::QuitarFondo($origen, $limpio) | Out-Null

""
"--- Buscando los iconos ---"
$cajas = [RecortaIconos]::Cajas($limpio)
"Iconos encontrados: $($cajas.Count)"
for ($i = 0; $i -lt $cajas.Count; $i++) {
  $c = $cajas[$i]
  "  $($i+1)) x=$($c.X) y=$($c.Y) ancho=$($c.Width) alto=$($c.Height)"
}

# Orden en la hoja: fila de arriba (4) y fila de abajo (3).
# Se guardan ya con el nombre de la disciplina de la app:
#   1 puñetazo      -> boxeo
#   2 guardia       -> mma            (no vino icono propio de MMA)
#   3 suelo         -> jiu-jitsu
#   4 rodilla       -> muay-thai
#   5 proyeccion gi -> judo
#   6 agarre        -> lucha
#   7 patada alta   -> taekwondo
$nombres = @(
  'boxeo',
  'mma',
  'jiu-jitsu',
  'muay-thai',
  'judo',
  'lucha',
  'taekwondo'
)

""
"--- Guardando recortes ---"
$rutas = @()
for ($i = 0; $i -lt [Math]::Min($cajas.Count, $nombres.Count); $i++) {
  $destino = Join-Path $salida "$($nombres[$i]).png"
  [RecortaIconos]::Guardar($limpio, $cajas[$i], 160, $destino)
  $rutas += $destino
  $kb = [Math]::Round((Get-Item $destino).Length / 1024, 1)
  "  {0,-16} {1,6} KB   (160x160, panel)" -f "$($nombres[$i]).png", $kb

  $chico = Join-Path $salidaMapa "$($nombres[$i]).png"
  [RecortaIconos]::Guardar($limpio, $cajas[$i], 48, $chico)
  $kb2 = [Math]::Round((Get-Item $chico).Length / 1024, 1)
  "  {0,-16} {1,6} KB   (48x48, mapa)" -f "mapa/$($nombres[$i]).png", $kb2
}

[RecortaIconos]::Preview($rutas, $preview)
""
"Vista previa: $preview"

# ---------------------------------------------------------------------------
# Archivo de datos que usa la app (los iconos en texto, para poder meterlos
# tambien dentro del mapa, que vive en un WebView)
# ---------------------------------------------------------------------------
$parejas = @(
  @{ clave = 'MMA';       archivo = 'mma' },
  @{ clave = 'Boxeo';     archivo = 'boxeo' },
  @{ clave = 'Jiu-jitsu'; archivo = 'jiu-jitsu' },
  @{ clave = 'Judo';      archivo = 'judo' },
  @{ clave = 'Lucha';     archivo = 'lucha' },
  @{ clave = 'Muay Thai'; archivo = 'muay-thai' },
  @{ clave = 'Taekwondo'; archivo = 'taekwondo' }
)

function Datos-Base64($carpeta) {
  $out = @()
  foreach ($p in $parejas) {
    $ruta = Join-Path $carpeta "$($p.archivo).png"
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($ruta))
    $out += "  '$($p.clave)': 'data:image/png;base64,$b64',"
  }
  return $out
}

$lineas = @(
  '// iconosDatos.js: los iconos de cada disciplina guardados en texto (data URI PNG).',
  '// ARCHIVO GENERADO: no se edita a mano.',
  '// Se rehace con herramientas/genera-iconos.ps1 a partir de la hoja de iconos;',
  '// los PNG quedan en assets/iconos. Se guardan en texto para poder usarlos igual',
  '// en la app y dentro del mapa (que vive en un WebView).',
  '',
  '// Iconos grandes: los que se ven en el panel de detalle',
  'export const ICONO_POR_DISCIPLINA = {'
)
$lineas += Datos-Base64 $salida
$lineas += '}'
$lineas += ''
$lineas += '// Iconos chicos: los del mapa (asi el mapa del celular no pesa de mas)'
$lineas += 'export const ICONO_POR_DISCIPLINA_MAPA = {'
$lineas += Datos-Base64 $salidaMapa
$lineas += '}'
$lineas += ''
$lineas += 'export const DISCIPLINAS_CON_ICONO = Object.keys(ICONO_POR_DISCIPLINA)'
$lineas += ''

$destinoJs = 'C:\strikely\components\iconosDatos.js'
[IO.File]::WriteAllText($destinoJs, ($lineas -join "`n"), (New-Object System.Text.UTF8Encoding $false))
$kbJs = [Math]::Round((Get-Item $destinoJs).Length / 1024)
""
"--- Generado ---"
"  components/iconosDatos.js        ($kbJs KB)"
"  assets/iconos/*.png              (160x160, fondo transparente)"
"  assets/iconos/mapa/*.png         (48x48, para el mapa)"
