# Guia: Como Adicionar Cabeçalho e Rodapé nas Propostas

## 📋 Visão Geral

As páginas internas da proposta (a partir da página 4) usam imagens de cabeçalho e rodapé que você pode personalizar fazendo upload dos arquivos.

## 📁 Localização

Salve as imagens em: `public/images/proposal/`

## 🎯 Arquivos Necessários

### 1. Cabeçalho (header.png)
- **Arquivo**: `header.png` ou `header.jpg`
- **Conteúdo**: QR Code, informações de contato, endereço, telefone
- **Posição**: Topo da página

### 2. Rodapé (footer.png)
- **Arquivo**: `footer.png` ou `footer.jpg`
- **Conteúdo**: Logo Double TI + Telecom, barra colorida
- **Posição**: Base da página

## 📐 Especificações Técnicas

### Dimensões Recomendadas
- **Cabeçalho**: 1920x200px (largura x altura)
- **Rodapé**: 1920x320px (largura x altura)
- **Proporção**: Manter a proporção original dos prints

### Formato
- **Preferencial**: PNG (melhor qualidade, suporta transparência)
- **Alternativo**: JPG (menor tamanho de arquivo)

### Qualidade
- **Resolução**: 150-300 DPI para impressão
- **Tamanho do arquivo**: Máximo 500KB por imagem

## 🛠️ Como Extrair as Imagens dos Prints

### Método 1: Usando um Editor de Imagens (Recomendado)

#### Photoshop / GIMP / Photopea
1. Abra o print original
2. Use a ferramenta de seleção retangular
3. Selecione apenas a área do cabeçalho
4. Copie (Ctrl+C) e cole em um novo arquivo (Ctrl+N)
5. Ajuste o tamanho para 1920x200px
6. Salve como PNG: `Arquivo > Exportar > Salvar para Web`
7. Repita para o rodapé (1920x250px)

#### Figma / Canva
1. Importe o print
2. Crie um frame com as dimensões corretas
3. Posicione sobre a área desejada
4. Exporte como PNG

### Método 2: Usando Ferramentas Online

#### Remove.bg (para remover fundo se necessário)
1. Acesse https://www.remove.bg
2. Faça upload do print
3. Baixe a imagem sem fundo
4. Recorte a área desejada

#### Photopea (Photoshop online gratuito)
1. Acesse https://www.photopea.com
2. Abra o print
3. Siga os mesmos passos do Photoshop

## 📝 Passo a Passo Completo

### 1. Preparar o Cabeçalho

```bash
# Estrutura do cabeçalho (Print 1):
# - QR Code (esquerda)
# - Informações de contato (centro-direita):
#   * contato@doubletelecom.com.br
#   * www.doubletelecom.com.br
#   * Rua Francisco Negrão, nº 175
#   * Água Verde – Curitiba / PR
#   * +55 (41) 3312-6600
#   * Ícone WhatsApp
```

1. Abra o print 1 em um editor
2. Selecione toda a área do cabeçalho (incluindo QR Code e informações)
3. Copie e cole em um novo arquivo
4. Redimensione para 1920x200px
5. Salve como `header.png`
6. Coloque em `public/images/proposal/header.png`

### 2. Preparar o Rodapé

```bash
# Estrutura do rodapé (Print 2):
# - Barra colorida superior (cyan/azul)
# - Logo Double TI + Telecom (esquerda)
# - Espaço para número da página (direita)
```

1. Abra o print 2 em um editor
2. Selecione toda a área do rodapé (barra colorida + logo)
3. Copie e cole em um novo arquivo
4. Redimensione para 1920x320px (altura maior para não cortar o telefone)
5. Salve como `footer.png`
6. Coloque em `public/images/proposal/footer.png`

### 3. Adicionar ao Projeto

```bash
# Estrutura de pastas:
public/
  images/
    proposal/
      header.png  ← Adicione aqui
      footer.png  ← Adicione aqui
      README.md
```

## ✅ Verificação

Após adicionar as imagens:

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página de propostas

3. Crie uma nova proposta e navegue até a página 4

4. Verifique se o cabeçalho e rodapé aparecem corretamente

## 🎨 Dicas de Qualidade

### Para Melhor Resultado:
- ✅ Use PNG para preservar qualidade
- ✅ Mantenha texto legível (mínimo 10pt)
- ✅ Certifique-se de que as cores estão corretas
- ✅ Verifique se o QR Code está nítido
- ✅ Teste em diferentes tamanhos de tela

### Evite:
- ❌ Imagens borradas ou pixeladas
- ❌ Texto muito pequeno
- ❌ Cores muito diferentes do original
- ❌ Arquivos muito grandes (>500KB)

## 🔄 Fallback Automático

Se as imagens não forem encontradas, o sistema exibe automaticamente:
- Mensagem indicando onde adicionar os arquivos
- Layout básico com cores similares
- Funcionalidade completa mantida

## 📞 Troubleshooting

### Imagem não aparece?
1. Verifique o nome do arquivo: `header.png` ou `footer.png`
2. Confirme a localização: `public/images/proposal/`
3. Reinicie o servidor: `npm run dev`
4. Limpe o cache do navegador: Ctrl+Shift+R

### Imagem aparece cortada?
1. Verifique as dimensões: 1920x200px (header) ou 1920x250px (footer)
2. Use `object-fit: cover` está configurado corretamente
3. Ajuste a proporção da imagem original

### Qualidade ruim?
1. Aumente a resolução para 300 DPI
2. Use PNG em vez de JPG
3. Exporte com qualidade máxima

## 📚 Recursos Úteis

- **Photopea** (Photoshop online): https://www.photopea.com
- **Remove.bg** (remover fundo): https://www.remove.bg
- **TinyPNG** (comprimir PNG): https://tinypng.com
- **Squoosh** (otimizar imagens): https://squoosh.app

---

**Última atualização**: Novembro 2025
