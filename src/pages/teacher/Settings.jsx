import SettingsPage from '../shared/SettingsPage'
import { currentTeacher } from '../../data/mockData'

export default function TeacherSettings() {
  return <SettingsPage user={currentTeacher} roleLabel="Teacher" />
}
