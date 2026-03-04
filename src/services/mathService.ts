export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  studyContent: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

const STATIC_QUESTION: MathQuestion = {
  id: "daily-1",
  topic: "Equações do Segundo Grau",
  difficulty: "Médio",
  question: "Determine as raízes da equação de segundo grau: $$x^2 - 5x + 6 = 0$$",
  options: [
    "x = 1 e x = 6",
    "x = 2 e x = 3",
    "x = -2 e x = -3",
    "x = 0 e x = 5"
  ],
  correctAnswerIndex: 1,
  explanation: "Utilizando a fórmula de Bhaskara ou Soma e Produto:\n\nSoma: $S = -b/a = 5$\nProduto: $P = c/a = 6$\n\nOs números que somados dão 5 e multiplicados dão 6 são 2 e 3.",
  studyContent: `
# Equações do Segundo Grau

Uma equação do segundo grau é toda equação da forma:
$$ax^2 + bx + c = 0$$
Onde $a, b, c$ são coeficientes reais e $a \\neq 0$.

## Fórmula de Bhaskara
Para encontrar as raízes, utilizamos o discriminante (Delta):
$$\\Delta = b^2 - 4ac$$

As raízes são dadas por:
$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$

## Relações de Girard (Soma e Produto)
Uma forma rápida de resolver equações quando $a = 1$:
- **Soma ($x_1 + x_2$):** $-b/a$
- **Produto ($x_1 \\cdot x_2$):** $c/a$

No exemplo da questão: $x^2 - 5x + 6 = 0$
- $a = 1, b = -5, c = 6$
- Soma $= -(-5)/1 = 5$
- Produto $= 6/1 = 6$
- Raízes: $2$ e $3$.
`
};

export async function getDailyQuestion(dateStr: string): Promise<MathQuestion> {
  // Simulando um delay de rede para manter a experiência de loading
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(STATIC_QUESTION);
    }, 800);
  });
}
