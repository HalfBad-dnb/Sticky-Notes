import { useState, useCallback } from 'react';
import { getApiUrl } from '../utils/api';
import logger from '../utils/logger';

const useGeminiAgent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const runAgent = useCallback(async (prompt, options = {}) => {
    const startTime = performance.now();
    const {
      model = 'gemini-2.0-flash',
      systemInstruction = null,
      temperature = 0.7,
      maxTokens = 1000
    } = options;

    logger.logAiOperation('BACKEND_AI_REQUEST', 'Starting AI request via backend');
    logger.time('Backend AI Request');

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      logger.logRequest('POST', getApiUrl('ai/gemini-chat'), { prompt });
      const response = await fetch(getApiUrl('ai/gemini-chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: systemInstruction,
          temperature: temperature,
          maxTokens: maxTokens
        })
      });

      logger.logResponse('POST', getApiUrl('ai/gemini-chat'), response.status);

      if (!response.ok) {
        logger.error('Backend AI request failed', { status: response.status, statusText: response.statusText });
        throw new Error(`Backend AI request failed: ${response.status}`);
      }

      const result = await response.json();
      const responseTime = performance.now() - startTime;
      
      logger.logPerformance('Backend AI Request', responseTime, 'Success');
      logger.timeEnd('Backend AI Request');
      
      setResponse({
        text: result.text || 'No response',
        model: result.model || 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
        responseTime: Math.round(responseTime),
        source: result.source || 'backend-ai'
      });

      return result.text;
    } catch (err) {
      const responseTime = performance.now() - startTime;
      logger.logAiError('BACKEND_AI_REQUEST', err, 'Failed to get response from backend');
      logger.timeEnd('Backend AI Request');
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    logger.debug('Cleared AI agent error');
    setError(null);
  }, []);

  const clearResponse = useCallback(() => {
    logger.debug('Cleared AI agent response');
    setResponse(null);
  }, []);

  return {
    runAgent,
    loading,
    error,
    response,
    clearError,
    clearResponse,
    isApiKeyConfigured: true // Always true since we use backend
  };
};

export default useGeminiAgent;
