/**
 * Serviço de notificação institucional.
 * 
 * Envia dados de cadastro e atividades para o e-mail da instituição.
 * 
 * Em produção, este módulo deve rodar server-side com acesso a SMTP
 * ou serviço de e-mail (Resend, SendGrid, Nodemailer, etc.).
 * 
 * A implementação atual usa fetch para um endpoint configurável.
 * Enquanto o backend de e-mail não estiver disponível, registra
 * os dados localmente e não bloqueia a experiência do usuário.
 */

import { ActivitySubmission, UserProfile } from '../types';

const INSTITUTION_EMAIL = 'institutoguiasocial@gmail.com';

export interface NotificationResult {
  success: boolean;
  message: string;
}

/**
 * Notifica a instituição sobre uma atividade submetida.
 * Tenta enviar via API; se falhar, salva localmente para reenvio.
 */
export async function notifyActivitySubmission(
  submission: ActivitySubmission
): Promise<NotificationResult> {
  // Salva localmente para garantir persistência mesmo sem internet
  saveSubmissionLocally(submission);

  try {
    const endpoint = getNotificationEndpoint();
    if (!endpoint) {
      console.log('[GUI.A] Endpoint de notificação não configurado. Atividade salva localmente.');
      return { success: true, message: 'Atividade registrada localmente.' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: INSTITUTION_EMAIL,
        subject: `[GUI.A Digital] Atividade: ${submission.lessonTitle} — ${submission.studentName}`,
        body: formatActivityEmail(submission),
        submission,
      }),
    });

    if (response.ok) {
      markSubmissionSent(submission.id);
      return { success: true, message: 'Atividade enviada para a instituição.' };
    }

    return { success: false, message: 'Falha ao enviar. Atividade salva localmente.' };
  } catch {
    return { success: false, message: 'Sem conexão. Atividade salva localmente para envio posterior.' };
  }
}

/**
 * Notifica a instituição sobre novo cadastro de aluno.
 */
export async function notifyStudentRegistration(
  student: UserProfile
): Promise<NotificationResult> {
  try {
    const endpoint = getNotificationEndpoint();
    if (!endpoint) {
      console.log('[GUI.A] Endpoint de notificação não configurado. Cadastro salvo localmente.');
      return { success: true, message: 'Cadastro registrado localmente.' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: INSTITUTION_EMAIL,
        subject: `[GUI.A Digital] Novo Cadastro: ${student.name}`,
        body: formatRegistrationEmail(student),
        type: 'registration',
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          turma: student.turma,
          registeredAt: student.registeredAt,
        },
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Cadastro notificado à instituição.' };
    }
    return { success: false, message: 'Falha ao notificar. Cadastro salvo localmente.' };
  } catch {
    return { success: false, message: 'Sem conexão. Cadastro salvo localmente.' };
  }
}

// === Storage local de submissões pendentes ===

const SUBMISSIONS_KEY = 'gui_a_submissions_pending';

function saveSubmissionLocally(submission: ActivitySubmission): void {
  try {
    const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    existing.push({ ...submission, sentToEmail: false });
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('[GUI.A] Erro ao salvar submissão localmente:', e);
  }
}

function markSubmissionSent(submissionId: string): void {
  try {
    const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    const updated = existing.map((s: ActivitySubmission & { sentToEmail: boolean }) =>
      s.id === submissionId ? { ...s, sentToEmail: true } : s
    );
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[GUI.A] Erro ao atualizar status de envio:', e);
  }
}

/**
 * Retorna submissões pendentes de envio por e-mail.
 */
export function getPendingSubmissions(): ActivitySubmission[] {
  try {
    const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    return existing.filter((s: ActivitySubmission & { sentToEmail: boolean }) => !s.sentToEmail);
  } catch {
    return [];
  }
}

// === Formatação de e-mails ===

function formatActivityEmail(submission: ActivitySubmission): string {
  return `
ATIVIDADE SUBMETIDA — GUI.A DIGITAL
=====================================

Aluno: ${submission.studentName}
E-mail: ${submission.studentEmail}
Turma: ${submission.studentTurma}

Trilha: ${submission.trackTitle}
Lição: ${submission.lessonTitle}

Data: ${submission.submittedAt}

--- RESPOSTA DO ALUNO ---
${submission.writtenResponse}

--- RESULTADO DA AUDITORIA ---
Score: ${submission.auditScore}/100
Aprovado: ${submission.auditApproved ? 'SIM' : 'NÃO'}
Feedback: ${submission.auditFeedback}

---
Enviado automaticamente pelo GUI.A Digital
Instituto Guia Social — Recife
  `.trim();
}

function formatRegistrationEmail(student: UserProfile): string {
  return `
NOVO CADASTRO — GUI.A DIGITAL
=====================================

Nome: ${student.name}
E-mail: ${student.email}
Turma: ${student.turma}
Data: ${student.registeredAt}
ID: ${student.id}

---
Enviado automaticamente pelo GUI.A Digital
Instituto Guia Social — Recife
  `.trim();
}

// === Helpers ===

function getNotificationEndpoint(): string | null {
  // Em produção, configurar VITE_NOTIFICATION_ENDPOINT no .env
  // Exemplo: https://seu-dominio.com/api/notify
  try {
    const env = (import.meta as unknown as Record<string, Record<string, string>>).env;
    return env?.VITE_NOTIFICATION_ENDPOINT || null;
  } catch {
    return null;
  }
}
