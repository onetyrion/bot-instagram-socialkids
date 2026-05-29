let globalSequence = 0;

function nextSequence() {
  globalSequence += 1;
  return globalSequence;
}

function formatMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ' {"meta":"[unserializable]"}';
  }
}

function emit(level, line) {
  if (level === 'ERROR') {
    console.error(line);
    return;
  }

  if (level === 'WARN') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function createRunId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RUN-${Date.now()}-${random}`;
}

export function createLogger({ scope = 'APP', runId = createRunId() } = {}) {
  const normalizedScope = String(scope).toUpperCase();

  const log = (level, event, message, meta = {}) => {
    const seq = String(nextSequence()).padStart(4, '0');
    const timestamp = new Date().toISOString();
    const safeEvent = event || 'EVENT';
    const safeMessage = message || '';
    const line = `[${timestamp}] [${runId}] [${seq}] [${level}] [${normalizedScope}] [${safeEvent}] ${safeMessage}${formatMeta(meta)}`;
    emit(level, line);
  };

  return {
    runId,
    scope: normalizedScope,
    child(childScope) {
      const nextScope = childScope ? `${normalizedScope}.${String(childScope).toUpperCase()}` : normalizedScope;
      return createLogger({ scope: nextScope, runId });
    },
    step(stepNumber, message, meta = {}) {
      const formattedStep = String(stepNumber).padStart(2, '0');
      log('INFO', `STEP_${formattedStep}`, message, meta);
    },
    info(event, message, meta = {}) {
      log('INFO', event, message, meta);
    },
    warn(event, message, meta = {}) {
      log('WARN', event, message, meta);
    },
    error(event, message, meta = {}) {
      log('ERROR', event, message, meta);
    }
  };
}
