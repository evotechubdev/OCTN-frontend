# OCTN — Frontend público

Home institucional da Organização de Consultoria Técnica Nutricional.

## Executar localmente

O projeto é estático e não exige instalação de dependências. Na pasta `frontend`,
execute um servidor HTTP local, por exemplo:

```powershell
python -m http.server 8080
```

Depois, acesse `http://localhost:8080`.

## Área profissional (fase de testes)

- Login: `admin`
- Senha: `1234`
- Os diagnósticos ILPI são salvos no `localStorage` do navegador em uso.
- Fotografias anexadas são reduzidas e armazenadas localmente; PDFs e planilhas são relacionados pelo nome no índice de anexos.
- O botão **Gerar PDF** abre a impressão do navegador; escolha **Salvar como PDF**.

Esta autenticação é apenas uma barreira de interface para o protótipo. Antes de publicar a área profissional para terceiros, substitua-a por Firebase Authentication e migre os registros locais para um banco com regras de acesso apropriadas.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica o conteúdo no GitHub
Pages automaticamente a cada push na branch `main`.
