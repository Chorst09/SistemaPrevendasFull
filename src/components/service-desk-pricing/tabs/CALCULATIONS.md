# Cálculos de Dimensionamento - Service Desk

## Visão Geral

Este documento explica os cálculos implementados para o dimensionamento automático de equipes de Service Desk, baseados na teoria de filas (Erlang C) e boas práticas da indústria.

## Fórmulas Implementadas

### 1. Volume de Chamados Mensal

```
Volume de Chamados/Mês = Quantidade de Usuários × Incidentes por Usuário/Mês
```

**Exemplo:**
- 100 usuários × 1.5 incidentes/usuário/mês = 150 chamados/mês

### 2. Cálculo Erlang C Simplificado

#### 2.1 Conversão para Chamados por Hora

```
Chamados por Dia = Volume Mensal ÷ 22 (dias úteis)
Chamados por Hora = Chamados por Dia ÷ 8 (horas de trabalho)
```

#### 2.2 Carga de Trabalho (Erlang)

```
Carga de Trabalho = (Chamados por Hora × TMA em minutos) ÷ 60
```

**Onde:**
- TMA = Tempo Médio de Atendimento em minutos
- Resultado em Erlangs (unidade de intensidade de tráfego)

#### 2.3 Ajuste por Taxa de Ocupação e Fator de Segurança

```
Fator de Ocupação = Taxa de Ocupação ÷ 100
Fator de Segurança = 1.2 (20% de margem)
Carga Ajustada = (Carga de Trabalho ÷ Fator de Ocupação) × Fator de Segurança
```

**Exemplo:**
- Se a carga é 2 Erlangs, taxa de ocupação é 80% e fator de segurança é 1.2
- Carga Ajustada = (2 ÷ 0.8) × 1.2 = 3.0 Erlangs

### 3. Distribuição entre Níveis (Método Híbrido)

#### 3.1 Método Erlang (Baseado em Carga)

```
Carga N1 = Carga Ajustada × (Distribuição N1 ÷ 100)
Carga N2 = Carga Ajustada × ((100 - Distribuição N1) ÷ 100)
Atendentes N1 (Erlang) = ARREDONDAR_PARA_CIMA(Carga N1)
Atendentes N2 (Erlang) = ARREDONDAR_PARA_CIMA(Carga N2)
```

#### 3.2 Método Capacidade (Baseado em Volume)

```
Chamados N1/Mês = Volume Total × (Distribuição N1 ÷ 100)
Chamados N2/Mês = Volume Total × ((100 - Distribuição N1) ÷ 100)
Atendentes N1 (Capacidade) = ARREDONDAR_PARA_CIMA(Chamados N1 ÷ 100)
Atendentes N2 (Capacidade) = ARREDONDAR_PARA_CIMA(Chamados N2 ÷ 75)
```

#### 3.3 Resultado Final

```
Atendentes N1 = MÁXIMO(1, MÁXIMO(N1 Erlang, N1 Capacidade))
Atendentes N2 = MÁXIMO(1, MÁXIMO(N2 Erlang, N2 Capacidade))
```

### 4. Ajuste para Turno de 6 Horas (N1)

Se o analista N1 trabalha 6 horas em vez de 8:

```
Capacidade Ajustada N1 = Capacidade N1 × 0.75
```

## Exemplo Prático

### Dados de Entrada:
- **Usuários:** 100
- **Incidentes/Usuário/Mês:** 1.5
- **TMA:** 10 minutos
- **Taxa de Ocupação:** 80%
- **Distribuição N1:** 80%

### Cálculos:

1. **Volume Mensal:**
   ```
   100 × 1.5 = 150 chamados/mês
   ```

2. **Chamados por Hora:**
   ```
   150 ÷ 22 ÷ 8 = 0.85 chamados/hora
   ```

3. **Carga de Trabalho:**
   ```
   (0.85 × 10) ÷ 60 = 0.14 Erlangs
   ```

4. **Carga Ajustada:**
   ```
   (0.14 ÷ 0.8) × 1.2 = 0.21 Erlangs
   ```

5. **Distribuição (Método Erlang):**
   ```
   N1: 0.21 × 0.8 = 0.17 Erlangs → 1 atendente
   N2: 0.21 × 0.2 = 0.04 Erlangs → 1 atendente
   ```

6. **Distribuição (Método Capacidade):**
   ```
   N1: 120 chamados ÷ 100 = 2 atendentes
   N2: 30 chamados ÷ 75 = 1 atendente
   ```

7. **Resultado Final:**
   ```
   N1: MÁXIMO(1, 2) = 2 atendentes
   N2: MÁXIMO(1, 1) = 1 atendente
   ```

## Validações e Limites

### Valores Mínimos
- **Atendentes N1:** Mínimo 1
- **Atendentes N2:** Mínimo 1
- **Taxa de Ocupação:** Entre 1% e 100%

### Valores de Referência
- **Capacidade N1:** 80-120 chamados/mês/8h (padrão: 100)
- **Capacidade N2:** 60-90 chamados/mês/8h (padrão: 75)
- **Taxa de Ocupação:** 70-85% (padrão: 80%)
- **TMA:** 5-15 minutos (padrão: 10)

## Considerações Importantes

### 1. Teoria de Erlang C
- Desenvolvida para sistemas de telecomunicações
- Assume chegada de chamadas seguindo distribuição de Poisson
- Tempo de atendimento segue distribuição exponencial
- Não há abandono de chamadas

### 2. Adaptações para Service Desk
- **Dias Úteis:** Considera 22 dias úteis por mês
- **Jornada:** 8 horas de trabalho efetivo por dia
- **Distribuição:** Separação entre níveis N1 e N2
- **Taxa de Ocupação:** Considera tempo não produtivo (pausas, treinamentos, etc.)

### 3. Fatores Não Considerados
- **Sazonalidade:** Variações ao longo do ano
- **Picos de Demanda:** Horários de maior movimento
- **Complexidade:** Variação na dificuldade dos chamados
- **Escalação:** Tempo gasto em escalações entre níveis

## Melhorias Futuras

### 1. Cálculo Avançado de Erlang C
- Implementar fórmula completa de Erlang C
- Considerar probabilidade de espera
- Calcular tempo médio de espera na fila

### 2. Análise de Cenários
- Cenário otimista, realista e pessimista
- Análise de sensibilidade dos parâmetros
- Simulação Monte Carlo

### 3. Fatores Adicionais
- Curva de aprendizado de novos funcionários
- Impacto de feriados e férias
- Variação sazonal da demanda
- Análise de SLA (Service Level Agreement)

## Referências

1. **Erlang C Formula:** A.K. Erlang (1917)
2. **Call Center Mathematics:** Ger Koole
3. **ITIL Service Operation:** Axelos
4. **ISO/IEC 20000:** Service Management Standards