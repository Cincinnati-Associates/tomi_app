/**
 * Exercise Scoring Engine
 *
 * Computes scores from exercise responses using the template's scoringRules config.
 * Supports two methods:
 * - weighted_sum: Each question has a score and weight; total = sum(score * weight)
 * - completeness: Score = % of questions answered (out of 100)
 */

interface ScoringRules {
  method: "weighted_sum" | "completeness";
  maxScore: number;
  weights?: Record<string, number>;
  readinessWeight?: number;
}

interface QuestionSchema {
  key: string;
  type: string;
  required?: boolean;
  options?: Array<{ value: string; score?: number }>;
}

interface ExerciseSchema {
  version: number;
  questions: QuestionSchema[];
}

/**
 * Compute scores for an exercise based on its scoring rules and user responses.
 */
export function computeExerciseScore(
  scoringRules: Record<string, unknown>,
  schema: Record<string, unknown>,
  responses: Record<string, unknown>
): Record<string, unknown> {
  const rules = scoringRules as unknown as ScoringRules;
  const exerciseSchema = schema as unknown as ExerciseSchema;

  if (rules.method === "weighted_sum") {
    return computeWeightedSum(rules, exerciseSchema, responses);
  }

  if (rules.method === "completeness") {
    return computeCompleteness(exerciseSchema, responses);
  }

  // Unknown method — return basic completeness
  return computeCompleteness(exerciseSchema, responses);
}

function computeWeightedSum(
  rules: ScoringRules,
  schema: ExerciseSchema,
  responses: Record<string, unknown>
): Record<string, unknown> {
  const questionScores: Record<string, number> = {};
  let totalRawScore = 0;

  for (const question of schema.questions) {
    const answer = responses[question.key];
    if (answer === undefined || answer === null) {
      questionScores[question.key] = 0;
      continue;
    }

    let score = 0;

    if (question.options) {
      // Look up score from option
      const selectedOption = question.options.find((opt) => {
        if (Array.isArray(answer)) {
          return answer.includes(opt.value);
        }
        return opt.value === answer;
      });

      if (selectedOption?.score !== undefined) {
        score = selectedOption.score;
      }

      // For multi_select, take the highest score among selected
      if (Array.isArray(answer)) {
        score = question.options
          .filter((opt) => answer.includes(opt.value))
          .reduce((max, opt) => Math.max(max, opt.score || 0), 0);
      }
    } else if (typeof answer === "number") {
      // Slider / number input — use raw value as score
      score = answer;
    }

    questionScores[question.key] = score;
    totalRawScore += score;
  }

  // Apply weights if provided
  let weightedTotal = 0;
  if (rules.weights) {
    for (const [key, weight] of Object.entries(rules.weights)) {
      weightedTotal += (questionScores[key] || 0) * weight;
    }
  } else {
    weightedTotal = totalRawScore;
  }

  return {
    questionScores,
    total: Math.round(weightedTotal * 100) / 100,
    maxScore: rules.maxScore,
    percentage: Math.round((weightedTotal / rules.maxScore) * 100),
  };
}

function computeCompleteness(
  schema: ExerciseSchema,
  responses: Record<string, unknown>
): Record<string, unknown> {
  const totalQuestions = schema.questions.length;
  let answeredCount = 0;

  for (const question of schema.questions) {
    const answer = responses[question.key];
    if (answer !== undefined && answer !== null && answer !== "") {
      if (Array.isArray(answer) && answer.length === 0) continue;
      answeredCount++;
    }
  }

  const percentage = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  return {
    answered: answeredCount,
    totalQuestions,
    total: percentage,
    maxScore: 100,
    percentage,
  };
}
