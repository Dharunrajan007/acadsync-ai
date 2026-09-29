import SettingsPage from '../shared/SettingsPage'
import { currentStudent } from '../../data/mockData'

export default function StudentSettings() {
  return <SettingsPage user={currentStudent} roleLabel="Student" />
}
