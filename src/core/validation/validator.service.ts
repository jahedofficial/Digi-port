export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidatorService {
  validateRequiredFields(obj: Record<string, unknown>, fields: string[]): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of fields) {
      const val = obj[field];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim().length === 0)) {
        errors.push({
          field,
          message: `Field '${field}' is required and cannot be empty`,
          code: 'REQUIRED_FIELD_MISSING',
          value: val,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateDateRange(startDate: string, endDate: string): ValidationResult {
    const errors: ValidationError[] = [];
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!isoDatePattern.test(startDate)) {
      errors.push({
        field: 'startDate',
        message: `startDate '${startDate}' must follow format YYYY-MM-DD`,
        code: 'INVALID_DATE_FORMAT',
        value: startDate,
      });
    }

    if (!isoDatePattern.test(endDate)) {
      errors.push({
        field: 'endDate',
        message: `endDate '${endDate}' must follow format YYYY-MM-DD`,
        code: 'INVALID_DATE_FORMAT',
        value: endDate,
      });
    }

    if (errors.length === 0) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (isNaN(start)) {
        errors.push({
          field: 'startDate',
          message: `startDate '${startDate}' is an invalid calendar date`,
          code: 'INVALID_CALENDAR_DATE',
          value: startDate,
        });
      }

      if (isNaN(end)) {
        errors.push({
          field: 'endDate',
          message: `endDate '${endDate}' is an invalid calendar date`,
          code: 'INVALID_CALENDAR_DATE',
          value: endDate,
        });
      }

      if (start > end) {
        errors.push({
          field: 'dateRange',
          message: `startDate (${startDate}) cannot be after endDate (${endDate})`,
          code: 'START_DATE_AFTER_END_DATE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validatePositiveNumber(value: unknown, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be a positive number greater than 0`,
        code: 'POSITIVE_NUMBER_REQUIRED',
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUrl(value: string, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must be a valid HTTP or HTTPS URL`,
          code: 'INVALID_PROTOCOL',
          value,
        });
      }
    } catch {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' is not a valid URL`,
        code: 'INVALID_URL',
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateEnum<T extends string>(value: unknown, allowedValues: readonly T[], fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be one of [${allowedValues.join(', ')}]`,
        code: 'INVALID_ENUM_VALUE',
        value,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];

    for (const res of results) {
      if (!res.isValid) {
        allErrors.push(...res.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}
