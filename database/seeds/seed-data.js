import bcrypt from 'bcryptjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { query, transaction } from '../../backend/src/core/config/database.js';
import { notify } from '../../backend/src/core/utils/records.js';
import { uploadDirectory } from '../../backend/src/modules/membership-enrolment/membershipEnrolment.routes.js';
export const demoPassword = 'AikidoDemo!2026';
export const demoUsers = [
  ['admin', 'Avery Admin', 'admin'],
  ['instructor-central', 'Mei Chen', 'instructor'],
  ['instructor-east', 'Daniel Wong', 'instructor'],
  ['pending', 'Alex Tan', 'applicant'],
  ['changes', 'Morgan Koh', 'applicant'],
  ['payment', 'Riley Teo', 'applicant'],
  ['draft', 'Taylor Goh', 'applicant'],
  ['rejected', 'Casey Ong', 'applicant'],
  ['jamie', 'Jamie Lim', 'student'],
  ['near', 'Sam Lee', 'student'],
  ['eligible', 'Jordan Ng', 'student'],
  ['ineligible', 'Chris Low', 'student'],
];
const schema = 'fsdp_v5';
// Fixture insertion is idempotent and never overwrites a user's later demo actions.
async function insert(table, record, key, tx) {
  const columns = Object.keys(record);
  const predicate = key.map((k) => `[${k}]=@${k}`).join(' AND ');
  await query(
    `IF NOT EXISTS(SELECT 1 FROM ${schema}.${table} WHERE ${predicate})
    INSERT ${schema}.${table}(${columns.map((k) => `[${k}]`).join(',')})
    VALUES(${columns.map((k) => `@${k}`).join(',')})`,
    record,
    tx,
  );
}
export async function seed() {
  const now = process.env.DEMO_REFERENCE_DATE
    ? new Date(process.env.DEMO_REFERENCE_DATE)
    : new Date();
  if (Number.isNaN(now.valueOf())) throw new Error('Invalid DEMO_REFERENCE_DATE.');
  const at = (days, hour = 10) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + days);
    date.setUTCHours(hour, 0, 0, 0);
    return date;
  };
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  await transaction(async (tx) => {
    for (const [id, name, role] of demoUsers)
      await insert(
        'Users',
        {
          id,
          email: `${id}@fsdp.demo`,
          name,
          role,
          passwordHash,
        },
        ['id'],
        tx,
      );
    for (const [id, name, address, region] of [
      [
        'central',
        'DEMO CENTRE — Central',
        'Fictional training studio, central Singapore',
        'Central',
      ],
      ['east', 'DEMO CENTRE — East', 'Fictional training studio, east Singapore', 'East'],
      ['west', 'DEMO CENTRE — West', 'Fictional training studio, west Singapore', 'West'],
    ])
      await insert('Dojos', { id, name, address, region, active: true }, ['id'], tx);
    for (const [id, name] of [
      [0, 'Beginner'],
      [1, '6th Kyu'],
      [2, '5th Kyu'],
      [3, '4th Kyu'],
      [4, '3rd Kyu'],
      [5, '2nd Kyu'],
      [6, '1st Kyu'],
      [7, 'ShoDan'],
    ])
      await insert('BeltLevels', { id, name }, ['id'], tx);
    for (const [id, name, description, minAge, maxAge, minBelt] of [
      [
        'adult',
        'Adult Aikido',
        'Build balance, controlled movement and confidence through partner practice.',
        16,
        120,
        0,
      ],
      [
        'children',
        'Children Aikido',
        'A supportive introduction to movement, focus and respectful training.',
        4,
        15,
        0,
      ],
      [
        'mixed',
        'Mixed Aikido',
        'Train together across generations in a welcoming fundamentals class.',
        4,
        120,
        0,
      ],
      [
        'weapons',
        'Weapons Practice',
        'Develop distance and coordination with supervised training equipment.',
        16,
        120,
        1,
      ],
      [
        'advanced',
        'Advanced Aikido',
        'Refine technique, timing and fluid movement with experienced partners.',
        16,
        120,
        3,
      ],
    ])
      await insert(
        'ClassTypes',
        { id, name, description, minAge, maxAge, minBelt, qualifying: true },
        ['id'],
        tx,
      );
    for (const [instructorId, dojoId] of [
      ['instructor-central', 'central'],
      ['instructor-central', 'west'],
      ['instructor-east', 'east'],
    ])
      await insert(
        'InstructorAssignments',
        { instructorId, dojoId },
        ['instructorId', 'dojoId'],
        tx,
      );
    for (const [id, label, value] of [
      [
        'registration_fee',
        'DEMO PRICE — annual membership registration (SGD cents)',
        '6000',
      ],
      ['training_fee', 'DEMO PRICE — illustrative monthly training (SGD cents)', '9000'],
      [
        'about',
        'About this prototype',
        'Aikido practice brings together movement, balance and respect. This student-built concept connects enrolment and training across centres.',
      ],
      ['source', 'Public context source', 'https://aikidoshinjukai.com.sg/'],
    ])
      await insert('Settings', { id, label, value }, ['id'], tx);
    for (const [id, fromBelt, toBelt, minMonths, minSessions, minAge, maxAge, label] of [
      [
        'rule-0',
        0,
        1,
        3,
        20,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-1',
        1,
        2,
        3,
        24,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-2',
        2,
        3,
        3,
        32,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-3',
        3,
        4,
        6,
        36,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-4',
        4,
        5,
        6,
        56,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-5',
        5,
        6,
        9,
        62,
        13,
        120,
        'DEMO RULE',
      ],
      [
        'rule-6',
        6,
        7,
        9,
        70,
        15,
        120,
        'DEMO RULE',
      ],
    ])
      await insert(
        'GradingRules',
        { id, fromBelt, toBelt, minMonths, minSessions, minAge, maxAge, label },
        ['id'],
        tx,
      );
    for (const [userId, , role] of demoUsers.filter(
      (u) => !['admin', 'instructor'].includes(u[2]),
    )) {
      const active = role === 'student';
      await insert(
        'StudentProfiles',
        {
          userId,
          phone: '0000 0000',
          dateOfBirth: '2000-02-10',
          dojoId: userId === 'ineligible' ? 'east' : 'central',
          beltId: active ? 1 : 0,
          rankStart: at(userId === 'ineligible' ? -3 : -120),
          verified: active || userId === 'payment',
          preferences: 'in-app',
        },
        ['userId'],
        tx,
      );
      const status = active
        ? 'active'
        : {
            pending: 'pending_review',
            changes: 'changes_requested',
            payment: 'approved_pending_payment',
            draft: 'draft',
            rejected: 'rejected',
          }[userId];
      await insert(
        'MembershipApplications',
        {
          id: `application-${userId}`,
          userId,
          status,
          data: JSON.stringify({
            phone: '0000 0000',
            dateOfBirth: '2000-02-10',
            dojoId: 'central',
            experience: active ? 'Fictional previous practice' : 'New to Aikido',
            claimedBelt: active ? '6th Kyu' : 'Beginner',
            guardianName: '',
            waiver: true,
            selectedSessionId: 'upcoming-1',
          }),
          reason:
            userId === 'changes'
              ? 'Please explain your previous training experience.'
              : userId === 'rejected'
                ? 'Fictional demo application declined; contact the office for assistance.'
                : null,
          submittedAt: status === 'draft' ? null : at(-2),
        },
        ['id'],
        tx,
      );
      await insert('WaiverConsents', { userId, guardianName: null }, ['userId'], tx);
      if (active || userId === 'payment') {
        await insert(
          'Memberships',
          {
            userId,
            memberNumber: `DEMO-${userId.toUpperCase()}`,
            status: active ? 'active' : 'pending_payment',
            expiresAt: at(365),
            waiverReason: active
              ? 'Development fixture: membership fee waived for fictional training demonstration.'
              : null,
          },
          ['userId'],
          tx,
        );
        await insert(
          'PaymentCharges',
          {
            id: `charge-${userId}`,
            studentId: userId,
            applicationId: `application-${userId}`,
            description: 'DEMO PRICE — annual membership registration',
            amount: 6000,
            currency: 'sgd',
            status: active ? 'waived' : 'pending',
            demoFixture: active,
          },
          ['id'],
          tx,
        );
        if (active || userId === 'payment')
          await insert(
            'StudentBeltHistory',
            {
              id: `rank-${userId}`,
              studentId: userId,
              beltId: active ? 1 : 0,
              verifiedBy: 'admin',
              startsAt: at(userId === 'ineligible' ? -3 : -120),
            },
            ['id'],
            tx,
          );
      }
      await notify(
        userId,
        'seed.welcome',
        'Fictional demonstration account. Training data and fees are synthetic.',
        tx,
      );
    }
    await insert(
      'AuditLogs',
      {
        id: 'audit-approved-payment',
        actorId: 'admin',
        action: 'application.approve',
        entityId: 'application-payment',
        details: '{"fixture":true,"reason":"Synthetic approval sample"}',
      },
      ['id'],
      tx,
    );
    const sessions = [];
    for (let index = 1; index <= 15; index++) {
      const dojoId = ['central', 'east', 'west'][(index - 1) % 3];
      sessions.push({
        id: `upcoming-${index}`,
        classTypeId: ['adult', 'mixed', 'children', 'weapons', 'advanced'][(index - 1) % 5],
        dojoId,
        instructorId: dojoId === 'east' ? 'instructor-east' : 'instructor-central',
        startsAt: at(index, 10),
        endsAt: at(index, 11),
        capacity: 12,
        active: true,
      });
    }
    for (let index = 1; index <= 6; index++)
      sessions.push({
        id: `history-${index}`,
        classTypeId: 'adult',
        dojoId: index % 2 ? 'central' : 'east',
        instructorId: index % 2 ? 'instructor-central' : 'instructor-east',
        startsAt: at(-20 + index, 10),
        endsAt: at(-20 + index, 11),
        capacity: 12,
        active: true,
      });
    sessions.push({
      id: 'transition-session',
      classTypeId: 'adult',
      dojoId: 'central',
      instructorId: 'instructor-central',
      startsAt: new Date(now.valueOf() - 30 * 60000),
      endsAt: new Date(now.valueOf() + 30 * 60000),
      capacity: 12,
      active: true,
    });
    for (const session of sessions) await insert('ClassSessions', session, ['id'], tx);
    for (const studentId of ['jamie', 'near', 'eligible', 'ineligible']) {
      const count = { jamie: 4, near: 2, eligible: 4, ineligible: 1 }[studentId];
      for (let index = 1; index <= count + 1; index++) {
        await insert(
          'ClassBookings',
          {
            id: `booking-${studentId}-${index}`,
            studentId,
            sessionId: `history-${index}`,
            status: 'confirmed',
          },
          ['id'],
          tx,
        );
        await insert(
          'AttendanceRecords',
          {
            id: `attendance-${studentId}-${index}`,
            studentId,
            sessionId: `history-${index}`,
            status: index <= count ? 'present' : 'absent',
            verifiedBy: index % 2 ? 'instructor-central' : 'instructor-east',
          },
          ['id'],
          tx,
        );
      }
      for (const sessionId of ['upcoming-1', 'upcoming-2'])
        await insert(
          'ClassBookings',
          {
            id: `booking-${studentId}-${sessionId}`,
            studentId,
            sessionId,
            status: 'confirmed',
          },
          ['id'],
          tx,
        );
    }
    await insert(
      'ClassBookings',
      {
        id: 'booking-near-transition',
        studentId: 'near',
        sessionId: 'transition-session',
        status: 'confirmed',
      },
      ['id'],
      tx,
    );
    await insert(
      'ExternalTrainingRecords',
      {
        id: 'external-near-verified',
        studentId: 'near',
        eventKey: 'external:seminar-01',
        centre: 'DEMO external seminar',
        happenedAt: at(-4),
        qualifying: true,
        verifiedBy: 'instructor-central',
      },
      ['id'],
      tx,
    );
    await insert(
      'ExternalTrainingRecords',
      {
        id: 'external-near-pending',
        studentId: 'near',
        eventKey: 'external:seminar-02',
        centre: 'DEMO unverified seminar',
        happenedAt: at(-2),
        qualifying: false,
        verifiedBy: null,
      },
      ['id'],
      tx,
    );
    for (const [id, name, days] of [
      ['grading-open', 'DEMO upcoming grading', 20],
      ['grading-today', 'DEMO assessment workshop', 0],
    ])
      await insert(
        'GradingSessions',
        {
          id,
          name,
          instructorId: 'instructor-central',
          opensAt: at(-10),
          closesAt: days ? at(15) : new Date(now.valueOf() - 60 * 60000),
          startsAt: days ? at(days) : new Date(now.valueOf() - 15 * 60000),
          active: true,
        },
        ['id'],
        tx,
      );
    await insert(
      'GradingApplications',
      {
        id: 'grading-eligible-today',
        studentId: 'eligible',
        gradingSessionId: 'grading-today',
        status: 'submitted',
      },
      ['id'],
      tx,
    );
    await insert(
      'GradingApplications',
      {
        id: 'grading-jamie-assessed',
        studentId: 'jamie',
        gradingSessionId: 'grading-today',
        status: 'assessed',
      },
      ['id'],
      tx,
    );
    await insert(
      'InstructorAssessments',
      {
        id: 'assessment-jamie',
        gradingApplicationId: 'grading-jamie-assessed',
        instructorId: 'instructor-central',
        result: 'recommend_pass',
        feedback: 'Synthetic assessment: controlled technique and respectful practice.',
        timeInRankDays: 120,
        acknowledgement: 'Mei Chen',
      },
      ['id'],
      tx,
    );
    for (const status of ['failed', 'expired'])
      await insert(
        'PaymentAttempts',
        {
          id: `fixture-attempt-${status}`,
          chargeId: 'charge-jamie',
          status,
          demoFixture: true,
        },
        ['id'],
        tx,
      );
    await insert(
      'ApplicationDocuments',
      {
        id: 'document-pending',
        applicationId: 'application-pending',
        storageName: 'synthetic-training.pdf',
        originalName: 'synthetic-training.pdf',
        mimeType: 'application/pdf',
        size: 400,
      },
      ['id'],
      tx,
    );
  });
  await mkdir(uploadDirectory, { recursive: true });
  const content =
    'BT /F1 16 Tf 50 750 Td (SYNTHETIC DEMO - No real person or identity data) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  await writeFile(
    new URL('synthetic-training.pdf', `file:///${uploadDirectory.replaceAll('\\', '/')}/`),
    pdf,
  );
  await query(
    "UPDATE fsdp_v5.ApplicationDocuments SET size=@size WHERE id='document-pending'",
    { size: Buffer.byteLength(pdf) },
  );
  console.log(
    'Seed complete: 12 fictional accounts, 3 centres, 22 sessions. Existing fixture edits preserved.',
  );
}
