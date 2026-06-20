export const SESSION_TABS_STORAGE_KEY = 'smartcampus_tabs'

export function clearSessionTabs() {
  sessionStorage.removeItem(SESSION_TABS_STORAGE_KEY)
}
