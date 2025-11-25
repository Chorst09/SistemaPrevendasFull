# Guia para Adicionar Logos dos Clientes

## 📋 Visão Geral

A página "Nossos Clientes" da proposta comercial exibe logos de 24 empresas clientes. Este guia explica como adicionar os logos reais.

## 📁 Localização dos Arquivos

Os logos devem ser salvos em: `public/images/clients/`

## 🎨 Especificações Técnicas

### Formato
- **Preferencial**: PNG com fundo transparente
- **Alternativo**: JPG com fundo branco

### Dimensões
- **Largura**: 400px (recomendado)
- **Altura**: 200px (recomendado)
- **Proporção**: 2:1 (largura:altura)

### Qualidade
- **Resolução**: 72-150 DPI (para web)
- **Tamanho do arquivo**: Máximo 200KB por logo

### Nomenclatura
Use apenas letras minúsculas, números e hífens (sem espaços ou caracteres especiais):
- ✅ Correto: `parana-clinicas.png`
- ❌ Errado: `Paraná Clínicas.png`

## 📝 Lista de Logos Necessários

| # | Nome do Arquivo | Cliente | Cores Principais |
|---|----------------|---------|------------------|
| 1 | `condor.png` | Condor | Azul |
| 2 | `jakomel.png` | Jakomel | Amarelo/Vermelho |
| 3 | `assai.png` | Assaí | Vermelho/Branco |
| 4 | `festival.png` | Festival | - |
| 5 | `denso.png` | Denso | Cinza |
| 6 | `luson.png` | Luson | Cinza |
| 7 | `grupopa.png` | Grupo PA | - |
| 8 | `balaroti.png` | Balaroti | Azul |
| 9 | `itambe.png` | Itambé | Verde |
| 10 | `baggio.png` | Baggio | Vermelho |
| 11 | `ers.png` | ERS | Laranja |
| 12 | `pizzattolog.png` | Pizzattolog | - |
| 13 | `metrocard.png` | Metrocard | Vermelho |
| 14 | `sideral.png` | Sideral | - |
| 15 | `gnissei.png` | Gnissei | Vermelho |
| 16 | `parana-clinicas.png` | Paraná Clínicas | Vermelho |
| 17 | `xv.png` | XV | Azul |
| 18 | `crystal.png` | Crystal | Cinza |
| 19 | `circulo-militar.png` | Círculo Militar | Azul |
| 20 | `santa-monica.png` | Santa Mônica | - |
| 21 | `santa-cruz.png` | Santa Cruz | Vermelho |
| 22 | `cobasi.png` | Cobasi | Azul |
| 23 | `lorene.png` | Lorene | Verde |
| 24 | `beautycolor.png` | Beauty Color | Rosa |

## 🚀 Como Adicionar os Logos

### Opção 1: Manualmente
1. Obtenha os logos em alta qualidade
2. Redimensione para 400x200px (se necessário)
3. Salve com o nome correto em `public/images/clients/`
4. Reinicie o servidor de desenvolvimento

### Opção 2: Usando Placeholders (Temporário)
```bash
# Execute o script para baixar placeholders
./scripts/download-client-logos.sh
```

## 🔄 Fallback Automático

Se um logo não for encontrado, o sistema automaticamente exibe o nome da empresa em texto estilizado com as cores corretas. Isso garante que a página sempre funcione, mesmo sem todos os logos.

## ✅ Verificação

Após adicionar os logos:
1. Acesse a página de propostas
2. Clique em "Nova Proposta Comercial"
3. Navegue até a página "Nossos Clientes" (página 3)
4. Verifique se os logos aparecem corretamente

## 🎨 Dicas de Design

- **Fundo transparente**: Permite melhor integração visual
- **Margens internas**: Deixe uma pequena margem ao redor do logo
- **Contraste**: Certifique-se de que o logo seja visível em fundo branco
- **Vetorização**: Se possível, use logos vetoriais (SVG) convertidos para PNG

## 📞 Suporte

Se tiver dúvidas sobre:
- Onde obter os logos oficiais → Entre em contato com o departamento de marketing
- Problemas técnicos → Verifique o console do navegador para erros
- Qualidade da imagem → Use ferramentas como Photoshop, GIMP ou Figma para edição

---

**Última atualização**: Novembro 2025
