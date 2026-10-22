"""Gera as folhas de estilo do catálogo a partir dos arquivos publicados.

Nada é redesenhado aqui: o CSS do sistema vem do 2º bloco <style> de
index.html, e as partes de formulário vêm do <style> de login/index.html,
com os seletores prefixados por .lg para não colidir com o shell.
Uso: python3 catalogo/gerar.py (a partir da raiz do repositório).
"""
import re, pathlib, hashlib

raiz = pathlib.Path(__file__).resolve().parent.parent
out = raiz / 'catalogo'

def blocos(html):
    return re.findall(r'<style>(.*?)</style>', html, re.S)

idx = (raiz / 'index.html').read_text(encoding='utf-8')
sistema = blocos(idx)[1]
(out / 'sistema.css').write_text(
    '/* GERADO por catalogo/gerar.py a partir de index.html (não editar). */\n' + sistema,
    encoding='utf-8')

lg = (raiz / 'login' / 'index.html').read_text(encoding='utf-8')
css = blocos(lg)[0]
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)          # sem comentários


def sem_blocos(texto, prefixo):
    """Remove blocos @media/@keyframes (com chaves aninhadas)."""
    out, i = [], 0
    while True:
        j = texto.find(prefixo, i)
        if j < 0:
            return ''.join(out) + texto[i:]
        out.append(texto[i:j])
        k, prof = texto.index('{', j), 0
        while True:
            if texto[k] == '{': prof += 1
            elif texto[k] == '}':
                prof -= 1
                if prof == 0: break
            k += 1
        i = k + 1


kf_fonte = css
css = sem_blocos(sem_blocos(css, '@media'), '@keyframes')
# regras do login usadas como componentes de formulário e estado
alvos = ('.field', '.ctl', '.err', '.caps', '.alert', '.otp', '.meter', '.rules', '.note',
         '.sep', '.check', '.link', '.spin', '.busy', '.done', '.steps', '.hint', '.intro',
         '.btn.block', '.ghost-req', '.pillar', '.radar', '.trust')
saida = []
for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
    sel, corpo = m.group(1).strip(), m.group(2)
    if not sel or sel.startswith(':root') or sel.startswith('@'):
        continue
    partes = [s.strip() for s in sel.split(',')]
    if any(p.startswith(alvos) for p in partes):
        saida.append(','.join('.lg ' + p for p in partes) + '{' + corpo + '}')
kf = re.findall(r'@keyframes (?:spin|hit)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}', kf_fonte)
(out / 'login-partes.css').write_text(
    '/* GERADO por catalogo/gerar.py a partir de login/index.html (não editar). */\n'
    + '\n'.join(saida) + '\n' + '\n'.join(kf) + '\n', encoding='utf-8')

for f in ('sistema.css', 'login-partes.css'):
    b = (out / f).read_bytes()
    print(f, len(b), hashlib.sha256(b).hexdigest()[:16])
