import { roles } from './seedRoles.js'

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'James', 'Amelia', 'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Zainab', 'Hassan', 'Ayesha', 'Bilal', 'Sara', 'Omar', 'Fatima', 'Ali']
const lastNames = ['Carter', 'Nguyen', 'Patel', 'Garcia', 'Kim', 'Rossi', 'Martin', 'Silva', 'Khan', 'Chen', 'Novak', 'Meyer', 'Osei', 'Diallo', 'Fischer', 'Suzuki', 'Ahmed', 'Malik', 'Farooq', 'Sheikh']
const avatarColors = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#2563EB', '#7C3AED']

// Generates deterministic filler users. Passwords are set separately in
// store.js (hashed) so this module has no bcrypt dependency.
export function generateSeedUsers(count) {
  const list = []
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[(i * 3 + 1) % lastNames.length]
    const roleCount = i % 5 === 0 ? 2 : 1
    const roleIdx = i % roles.length
    const userRoles = [roles[roleIdx].name]
    if (roleCount === 2) userRoles.push(roles[(roleIdx + 2) % roles.length].name)
    const status = i % 9 === 0 ? 'suspended' : i % 6 === 0 ? 'inactive' : 'active'
    const day = String((i % 27) + 1).padStart(2, '0')
    const month = String(((i * 2) % 12) + 1).padStart(2, '0')
    list.push({
      id: `u${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@northgate.io`,
      roles: userRoles,
      directPermissions: [],
      status,
      createdAt: `2025-${month}-${day}`,
      lastLogin: i % 7 === 0 ? null : `2026-08-${String((i % 12) + 1).padStart(2, '0')}T0${(i % 9) + 1}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}:00`,
      avatarColor: avatarColors[i % avatarColors.length],
    })
  }
  return list
}
