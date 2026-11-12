# Screen coverage

| Design screen              | Route                                     |
| -------------------------- | ----------------------------------------- |
| 01. Home                   | /                                         |
| 02. About                  | /about                                    |
| 03. Classes                | /classes                                  |
| 04. Class details          | /classes/:classId                         |
| 05. Dojos                  | /dojos                                    |
| 06. Grading information    | /grading-info                             |
| 07. Fees                   | /fees                                     |
| 08. How to join            | /how-to-join                              |
| 09. Sign in                | /login                                    |
| 10. Register               | /register                                 |
| 11. Membership application | /enrolment                                |
| 12. Application status     | /enrolment/status                         |
| 13. Student dashboard      | /student                                  |
| 14. Book classes           | /student/classes                          |
| 15. My bookings            | /student/bookings                         |
| 16. Attendance             | /student/attendance                       |
| 17. Readiness              | /student/grading-readiness                |
| 18. Grading applications   | /student/grading-applications             |
| 19. Notifications          | /student/notifications                    |
| 20. Membership & payments  | /student/membership                       |
| 21. Profile                | /student/profile                          |
| 22. Instructor dashboard   | /instructor                               |
| 23. Attendance roster      | /instructor/classes/:sessionId/attendance |
| 24. Student progress       | /instructor/students                      |
| 25. Assessments            | /instructor/assessments                   |
| 26. Admin dashboard        | /admin                                    |
| 27. Application reviews    | /admin/enrolments                         |
| 28. Members                | /admin/members                            |
| 29. Reports                | /admin/reports                            |

Additional routes: /payments, /payments/result, /admin/manage, /admin/payments.
All are mounted in frontend/src/app/App.jsx and consume the shared API-backed state.
