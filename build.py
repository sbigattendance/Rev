"""Rebuild the self-contained portal index without a JavaScript build dependency."""
from pathlib import Path
import base64
root=Path(__file__).resolve().parent
s=(root/'src/shell.html').read_text()
for name,path in [('CSS','src/styles.css'),('HOME_MODULES','src/home-modules.html'),('QR','vendor/qrcode.min.js'),('TRANSPORT','src/transport.js'),('APP','src/app.js')]:
 s=s.replace('__'+name+'__',(root/path).read_text())
s=s.replace('__LOGO__','data:image/png;base64,'+base64.b64encode((root/'logo.png').read_bytes()).decode())
s=s.replace('__STUDIO_RULES__',(root/'src/rules.html').read_text().replace('`','&#96;').replace('${','&#36;{'))
(root/'index.html').write_text(s)
print('Built index.html:',len(s),'characters')
