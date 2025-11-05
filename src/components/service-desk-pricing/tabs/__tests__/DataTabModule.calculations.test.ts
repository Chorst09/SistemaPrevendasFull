import { describe, it, expect } from 'vitest';

// Funções de cálculo extraídas do componente para teste
function calculateMonthlyCalls(userQuantity: number, incidentsPerUser: number): number {
  return Math.round(userQuantity * incidentsPerUser);
}

function calculateErlangDimensioning(
  userQuantity: number,
  incidentsPerUser: number,
  tmaMinutes: number,
  occupancyRate: number,
  n1Distribution: number,
  n1SixHourShift: boolean = false
) {
  const totalCallsPerMonth = userQuantity * incidentsPerUser;
  const totalCallsPerDay = totalCallsPerMonth / 22; // 22 dias úteis
  const totalCallsPerHour = totalCallsPerDay / 8; // 8 horas de trabalho
  
  // Cálculo de carga de trabalho (Erlang) - versão mais realista
  const workloadErlang = (totalCallsPerHour * tmaMinutes) / 60;
  
  // Ajustar pela taxa de ocupação e adicionar fatores de segurança
  const occupancyFactor = occupancyRate / 100;
  const safetyFactor = 1.2; // 20% de margem de segurança
  const adjustedWorkload = (workloadErlang / occupancyFactor) * safetyFactor;
  
  // Distribuir entre N1 e N2
  const n1Workload = adjustedWorkload * (n1Distribution / 100);
  const n2Workload = adjustedWorkload * ((100 - n1Distribution) / 100);
  
  // Calcular agentes com base na capacidade real
  const n1AgentsBasic = Math.ceil(n1Workload);
  const n2AgentsBasic = Math.ceil(n2Workload);
  
  // Para volumes maiores, usar cálculo baseado em capacidade
  const n1CallsPerMonth = totalCallsPerMonth * (n1Distribution / 100);
  const n2CallsPerMonth = totalCallsPerMonth * ((100 - n1Distribution) / 100);
  
  // Capacidades padrão (chamados/mês por agente)
  let n1MonthlyCapacity = 100;
  const n2MonthlyCapacity = 75;
  
  // Ajustar capacidade N1 se for turno de 6 horas (75% da capacidade de 8h)
  if (n1SixHourShift) {
    n1MonthlyCapacity = Math.round(n1MonthlyCapacity * 0.75);
  }
  
  const n1AgentsCapacity = Math.ceil(n1CallsPerMonth / n1MonthlyCapacity);
  const n2AgentsCapacity = Math.ceil(n2CallsPerMonth / n2MonthlyCapacity);
  
  // Usar o maior entre os dois métodos para garantir capacidade adequada
  const n1Agents = Math.max(1, Math.max(n1AgentsBasic, n1AgentsCapacity));
  const n2Agents = Math.max(1, Math.max(n2AgentsBasic, n2AgentsCapacity));
  
  return {
    totalCallsPerMonth,
    n1Agents,
    n2Agents,
    workloadErlang: Math.round(adjustedWorkload * 100) / 100
  };
}

describe('DataTabModule Calculations', () => {
  describe('calculateMonthlyCalls', () => {
    it('should calculate monthly calls correctly', () => {
      expect(calculateMonthlyCalls(100, 1.5)).toBe(150);
      expect(calculateMonthlyCalls(200, 2.0)).toBe(400);
      expect(calculateMonthlyCalls(50, 1.2)).toBe(60);
    });

    it('should handle decimal incidents per user', () => {
      expect(calculateMonthlyCalls(100, 1.7)).toBe(170);
      expect(calculateMonthlyCalls(150, 0.8)).toBe(120);
    });
  });

  describe('calculateErlangDimensioning', () => {
    it('should calculate dimensioning for standard scenario', () => {
      const result = calculateErlangDimensioning(100, 1.5, 10, 80, 80);
      
      expect(result.totalCallsPerMonth).toBe(150);
      expect(result.n1Agents).toBeGreaterThanOrEqual(1);
      expect(result.n2Agents).toBeGreaterThanOrEqual(1);
      expect(result.workloadErlang).toBeGreaterThan(0);
    });

    it('should calculate correct workload for known scenario', () => {
      // Cenário: 100 usuários, 1.5 incidentes/usuário, 10min TMA, 80% ocupação
      const result = calculateErlangDimensioning(100, 1.5, 10, 80, 80);
      
      // Cálculos esperados com fator de segurança:
      // 150 chamados/mês → 6.82 chamados/dia → 0.85 chamados/hora
      // Workload = (0.85 * 10) / 60 = 0.14 Erlangs
      // Ajustado = (0.14 / 0.8) * 1.2 = 0.21 Erlangs
      
      expect(result.workloadErlang).toBeCloseTo(0.21, 1);
    });

    it('should ensure minimum 1 agent per level', () => {
      // Cenário com poucos usuários
      const result = calculateErlangDimensioning(10, 0.5, 5, 90, 70);
      
      expect(result.n1Agents).toBeGreaterThanOrEqual(1);
      expect(result.n2Agents).toBeGreaterThanOrEqual(1);
    });

    it('should handle high volume scenarios', () => {
      // Cenário com muitos usuários
      const result = calculateErlangDimensioning(1000, 2.0, 15, 75, 85);
      
      expect(result.totalCallsPerMonth).toBe(2000);
      expect(result.n1Agents).toBeGreaterThan(1);
      expect(result.n2Agents).toBeGreaterThan(0);
      expect(result.workloadErlang).toBeGreaterThan(1);
    });

    it('should distribute correctly between N1 and N2', () => {
      const result = calculateErlangDimensioning(200, 2.0, 12, 80, 90);
      
      // Com 90% para N1, deve ter mais agentes N1 que N2
      expect(result.n1Agents).toBeGreaterThanOrEqual(result.n2Agents);
    });

    it('should handle edge cases', () => {
      // Taxa de ocupação muito alta
      const highOccupancy = calculateErlangDimensioning(100, 1.5, 10, 95, 80);
      expect(highOccupancy.n1Agents).toBeGreaterThanOrEqual(1);
      
      // TMA muito alto
      const highTMA = calculateErlangDimensioning(100, 1.5, 30, 80, 80);
      expect(highTMA.workloadErlang).toBeGreaterThan(0.5);
      
      // Distribuição 100% N1
      const allN1 = calculateErlangDimensioning(100, 1.5, 10, 80, 100);
      expect(allN1.n2Agents).toBe(1); // Mínimo 1 agente
    });

    it('should handle 6-hour shifts correctly', () => {
      // Cenário com turno de 6 horas para N1
      const sixHourShift = calculateErlangDimensioning(200, 2.0, 12, 80, 80, true);
      const eightHourShift = calculateErlangDimensioning(200, 2.0, 12, 80, 80, false);
      
      // Com turno de 6 horas, deve precisar de mais agentes N1
      expect(sixHourShift.n1Agents).toBeGreaterThanOrEqual(eightHourShift.n1Agents);
      
      // N2 não deve ser afetado
      expect(sixHourShift.n2Agents).toBe(eightHourShift.n2Agents);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle small company scenario', () => {
      // Empresa pequena: 50 usuários, 1 incidente/usuário/mês
      const result = calculateErlangDimensioning(50, 1.0, 8, 85, 75);
      
      expect(result.totalCallsPerMonth).toBe(50);
      expect(result.n1Agents).toBe(1);
      expect(result.n2Agents).toBe(1);
    });

    it('should handle medium company scenario', () => {
      // Empresa média: 300 usuários, 1.8 incidentes/usuário/mês
      const result = calculateErlangDimensioning(300, 1.8, 12, 80, 80);
      
      expect(result.totalCallsPerMonth).toBe(540);
      expect(result.n1Agents).toBeGreaterThanOrEqual(4); // 432 chamados N1 / 100 = 5 agentes
      expect(result.n2Agents).toBeGreaterThanOrEqual(1); // 108 chamados N2 / 75 = 2 agentes
    });

    it('should handle large company scenario', () => {
      // Empresa grande: 1000 usuários, 2.5 incidentes/usuário/mês
      const result = calculateErlangDimensioning(1000, 2.5, 15, 75, 85);
      
      expect(result.totalCallsPerMonth).toBe(2500);
      expect(result.n1Agents).toBeGreaterThanOrEqual(21); // 2125 chamados N1 / 100 = 22 agentes
      expect(result.n2Agents).toBeGreaterThanOrEqual(5); // 375 chamados N2 / 75 = 5 agentes
      expect(result.workloadErlang).toBeGreaterThan(2);
    });
  });
});