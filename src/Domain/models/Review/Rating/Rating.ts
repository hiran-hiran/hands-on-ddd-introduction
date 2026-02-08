import { ValueObject } from "Domain/models/shared/ValueObject";

type RatingValue = number;

export class Rating extends ValueObject<RatingValue, "Rating"> {
  static readonly MAX = 5;
  static readonly MIN = 1;

  constructor(value: RatingValue) {
    super(value);
  }

  protected validate(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Ratingは、整数値で");
    }
    if (value < Rating.MIN || value > Rating.MAX) {
      throw new Error("Ratingは、1から5の間で");
    }
  }

  // 評価の品質係数 - 0.0~1.0の範囲
  getQualityFactor(): number {
    return (this._value - Rating.MIN) / (Rating.MAX - Rating.MIN);
  }
}
