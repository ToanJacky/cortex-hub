export type DependencyStatus = 'ok' | 'error' | 'not_configured'

const OPTIONAL_DEPENDENCIES = new Set(['cliproxy', 'ollama', 'chatModel'])

export function dependencyHealthIsOk(name: string, status: DependencyStatus): boolean {
  return OPTIONAL_DEPENDENCIES.has(name) ? status !== 'error' : status === 'ok'
}
