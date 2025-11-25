#!/bin/bash

# Script para baixar logos de exemplo dos clientes
# Execute: chmod +x scripts/download-client-logos.sh && ./scripts/download-client-logos.sh

echo "Baixando logos de exemplo dos clientes..."

# Criar diretório se não existir
mkdir -p public/images/clients

# Usar placeholders do Unsplash para logos de empresas
# Você deve substituir estes por logos reais

# Condor
curl -L "https://via.placeholder.com/400x200/0066CC/FFFFFF?text=Condor" -o public/images/clients/condor.png

# Jakomel
curl -L "https://via.placeholder.com/400x200/FFD700/CC0000?text=JAKOMEL" -o public/images/clients/jakomel.png

# Assaí
curl -L "https://via.placeholder.com/400x200/FFFFFF/CC0000?text=ASSAI" -o public/images/clients/assai.png

# Festival
curl -L "https://via.placeholder.com/400x200/FFFFFF/666666?text=Festival" -o public/images/clients/festival.png

# Denso
curl -L "https://via.placeholder.com/400x200/FFFFFF/333333?text=DENSO" -o public/images/clients/denso.png

# Luson
curl -L "https://via.placeholder.com/400x200/FFFFFF/333333?text=Luson" -o public/images/clients/luson.png

# Grupo PA
curl -L "https://via.placeholder.com/400x200/FFFFFF/333333?text=Grupo+PA" -o public/images/clients/grupopa.png

# Balaroti
curl -L "https://via.placeholder.com/400x200/FFFFFF/0066CC?text=Balaroti" -o public/images/clients/balaroti.png

# Itambé
curl -L "https://via.placeholder.com/400x200/FFFFFF/00AA00?text=ITAMBE" -o public/images/clients/itambe.png

# Baggio
curl -L "https://via.placeholder.com/400x200/FFFFFF/CC0000?text=BAGGIO" -o public/images/clients/baggio.png

# ERS
curl -L "https://via.placeholder.com/400x200/FFFFFF/FF6600?text=ERS" -o public/images/clients/ers.png

# Pizzattolog
curl -L "https://via.placeholder.com/400x200/FFFFFF/666666?text=PIZZATTOLOG" -o public/images/clients/pizzattolog.png

# Metrocard
curl -L "https://via.placeholder.com/400x200/FFFFFF/CC0000?text=metrocard" -o public/images/clients/metrocard.png

# Sideral
curl -L "https://via.placeholder.com/400x200/FFFFFF/333333?text=SIDERAL" -o public/images/clients/sideral.png

# Gnissei
curl -L "https://via.placeholder.com/400x200/FFFFFF/CC0000?text=Gnissei" -o public/images/clients/gnissei.png

# Paraná Clínicas
curl -L "https://via.placeholder.com/400x200/FFFFFF/990000?text=Parana+Clinicas" -o public/images/clients/parana-clinicas.png

# XV
curl -L "https://via.placeholder.com/400x200/FFFFFF/0066CC?text=XV" -o public/images/clients/xv.png

# Crystal
curl -L "https://via.placeholder.com/400x200/FFFFFF/666666?text=CRYSTAL" -o public/images/clients/crystal.png

# Círculo Militar
curl -L "https://via.placeholder.com/400x200/FFFFFF/003366?text=Circulo+Militar" -o public/images/clients/circulo-militar.png

# Santa Mônica
curl -L "https://via.placeholder.com/400x200/FFFFFF/666666?text=Santa+Monica" -o public/images/clients/santa-monica.png

# Santa Cruz
curl -L "https://via.placeholder.com/400x200/FFFFFF/CC0000?text=SANTA+CRUZ" -o public/images/clients/santa-cruz.png

# Cobasi
curl -L "https://via.placeholder.com/400x200/FFFFFF/0066AA?text=Cobasi" -o public/images/clients/cobasi.png

# Lorene
curl -L "https://via.placeholder.com/400x200/FFFFFF/00AA00?text=Lorene" -o public/images/clients/lorene.png

# Beauty Color
curl -L "https://via.placeholder.com/400x200/FFFFFF/FF1493?text=BEAUTYCOLOR" -o public/images/clients/beautycolor.png

echo "✓ Logos de exemplo baixados com sucesso!"
echo "⚠️  IMPORTANTE: Substitua os placeholders pelos logos reais dos clientes"
echo "📁 Localização: public/images/clients/"
