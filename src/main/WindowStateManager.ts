import { BrowserWindow } from 'electron'

import appConfig from 'electron-settings'

const DEFAULT_WINDOW_STATE = {
  x: undefined as number | undefined,
  y: undefined as number | undefined,
  width: 1280,
  height: 720,
  isMaximized: false
}

export class WindowStateManager {
  private state = DEFAULT_WINDOW_STATE

  constructor(private name: string) {
    if (appConfig.hasSync(`windowState.${this.name}`)) {
      this.state = appConfig.getSync(`windowState.${this.name}`) as any
    }
  }

  private saveState = (window: BrowserWindow) => {
    this.state = {
      ...window.getBounds(),
      isMaximized: window.isMaximized()
    }

    appConfig.setSync(`windowState.${this.name}`, this.state as any)
  }

  public getState() {
    return this.state
  }

  public track(window: BrowserWindow) {
    window.on('resize', () => this.saveState(window))
    window.on('move', () => this.saveState(window))
    window.on('close', () => this.saveState(window))
  }
}
