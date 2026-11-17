import { Router } from 'express';
import multer from 'multer';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, transaction } from '../../core/config/database.js';
import { ensure } from '../../core/errors/HttpError.js';
import { memberRoles, roles } from '../../core/middleware/auth.js';
import { id, audit } from '../../core/utils/records.js';
import { applicationDraft } from './membershipEnrolment.validation.js';
import {
  applicationFor,
  saveDraft,
  submitApplication,
} from './membershipEnrolment.service.js';
export const membershipEnrolmentRouter = Router();
export const uploadDirectory = fileURLToPath(new URL('../../../uploads/', import.meta.url));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});
membershipEnrolmentRouter.get('/', memberRoles, async (req, res) => {
  const application = await applicationFor(req.user.id);
  const documents = application
    ? await query(
        `SELECT id,originalName,size FROM fsdp_v5.ApplicationDocuments
    WHERE applicationId=@id`,
        { id: application.id },
      )
    : [];
  res.json({ application, documents });
});
membershipEnrolmentRouter.put('/draft', memberRoles, async (req, res) =>
  res.json(await saveDraft(req.user.id, applicationDraft.parse(req.body))),
);
membershipEnrolmentRouter.post('/submit', memberRoles, async (req, res) =>
  res.json(await submitApplication(req.user.id)),
);
membershipEnrolmentRouter.post(
  '/documents',
  memberRoles,
  upload.single('document'),
  async (req, res) => {
    ensure(req.file, 400, 'Choose a synthetic PDF document (maximum 2 MB).');
    // Only demo PDFs are accepted. Files are never served as public assets or inline HTML.
    ensure(
      req.file.mimetype === 'application/pdf' &&
        req.file.buffer.subarray(0, 5).toString() === '%PDF-',
      400,
      'Only PDF documents with a valid PDF header are accepted.',
    );
    const storageName = `${id()}.pdf`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, storageName), req.file.buffer);
    try {
      await transaction(async (tx) => {
        const application = await applicationFor(req.user.id, tx);
        ensure(
          application && ['draft', 'changes_requested'].includes(application.status),
          409,
          'Save an editable application before uploading.',
        );
        const [{ total }] = await query(
          'SELECT COUNT(*) total FROM fsdp_v5.ApplicationDocuments WHERE applicationId=@id',
          { id: application.id },
          tx,
        );
        ensure(total < 3, 400, 'Maximum three demo evidence documents per application.');
        await query(
          `INSERT fsdp_v5.ApplicationDocuments(id,applicationId,storageName,originalName,mimeType,size)
        VALUES(@id,@applicationId,@storageName,@originalName,'application/pdf',@size)`,
          {
            id: id(),
            applicationId: application.id,
            storageName,
            originalName: path
              .basename(req.file.originalname)
              .replace(/[^a-zA-Z0-9._ -]/g, '_')
              .slice(0, 120),
            size: req.file.size,
          },
          tx,
        );
      });
    } catch (error) {
      await unlink(path.join(uploadDirectory, storageName));
      throw error;
    }
    res.status(201).json({ message: 'Private evidence uploaded.' });
  },
);
membershipEnrolmentRouter.get('/documents/:id', roles('admin'), async (req, res) => {
  const [document] = await query(
    'SELECT * FROM fsdp_v5.ApplicationDocuments WHERE id=@id',
    { id: req.params.id },
  );
  ensure(document, 404, 'Document not found.');
  const file = await readFile(path.join(uploadDirectory, document.storageName)).catch(
    () => null,
  );
  ensure(
    file,
    404,
    'Demo document is absent locally. Re-seed or re-upload the synthetic PDF.',
  );
  await audit(req.user.id, 'document.downloaded', document.id, {});
  res
    .set('Content-Type', 'application/pdf')
    .set('Cache-Control', 'no-store')
    .set('Content-Disposition', `attachment; filename="${document.originalName}"`)
    .send(file);
});
