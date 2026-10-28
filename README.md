# irmen-jarvis-demo

Prévia estática e demonstrativa do protótipo visual **Portal IRMEN Jarvis**.

- Acesso: <https://abaramagold91.github.io/irmen-jarvis-demo/>
- Simulador JARVIS (SIM-UI-01-REV02), laboratório com a tela nova e a homologada lado a lado: <https://abaramagold91.github.io/irmen-jarvis-demo/simulador/> · [testes](https://abaramagold91.github.io/irmen-jarvis-demo/simulador/testes.html)
- Todos os dados são fictícios. Não há backend, login, credenciais nem conexão com o sistema oficial.
- Sem CDN: ECharts 5.5.0 e as fontes (Chakra Petch, IBM Plex Sans, JetBrains Mono) estão em `vendor/`, com as licenças.

## Documentação

- [Leia-me e como rodar localmente](documentacao/LEIA-ME.md)
- [Roteiro de navegação](documentacao/ROTEIRO-DE-NAVEGACAO.md): telas, perfis, fluxos guiados, estados e o que é funcional, simulado ou ausente
- [Arquitetura do protótipo](documentacao/ARQUITETURA-DO-PROTOTIPO.md): como este protótipo é feito, separado da arquitetura proposta para o Portal real
- [Relatório de verificação](documentacao/RELATORIO-DE-VERIFICACAO.md): testes em desktop, tablet e celular, nos dois temas, e problemas conhecidos
- [Licenças de terceiros](documentacao/LICENCAS-DE-TERCEIROS.md)

## Rodar localmente

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Abra <http://127.0.0.1:8765/>.
