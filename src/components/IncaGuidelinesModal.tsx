import React from 'react';
import { X, ExternalLink, ShieldCheck, Heart, Award, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function IncaGuidelinesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Diretrizes INCA de Prevenção do Câncer</h2>
              <p className="text-xs text-slate-300">Instituto Nacional de Câncer — Ministério da Saúde</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-900 flex items-start gap-3">
            <Heart className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base">Até 50% dos casos de câncer podem ser prevenidos!</p>
              <p className="text-xs text-purple-800 mt-1">
                De acordo com as publicações oficiais do INCA e da OMS, a adoção de hábitos saudáveis e a eliminação de fatores de risco são as ferramentas mais poderosas de saúde pública.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">1</span>
                Tabagismo Zero
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O cigarro convencional e eletrônicos contêm substâncias tóxicas associadas ao câncer de pulmão, cavidade oral, laringe, bexiga, esôfago e outros.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                Alimentação In Natura
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Priorize frutas, legumes, verduras e cereais integrais. Evite alimentos ultraprocessados e carnes processadas (salsicha, bacon, linguiça e presunto).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">3</span>
                Proteção Solar Consciente
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evite exposição ao sol entre 10h e 16h. Use protetor solar de amplo espectro, óculos de sol, chapéus e roupas com proteção UV.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
                Atividade Física Diária
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao menos 150 minutos semanais de atividade moderada ajudam a regular hormônios, combater o sobrepeso e diminuir risco de câncer de mama e intestino.
              </p>
            </div>
          </div>

          {/* References & Links from user prompt */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Documentos Oficiais do INCA Utilizados neste Quiz
            </h4>

            <div className="space-y-2">
              <a
                href="https://www.inca.gov.br/sites/ufu.sti.inca.local/files//media/document//publicacao-21fatos-inca-dmc2021-final.pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                    21 Fatos sobre o Câncer — INCA (PDF Oficial)
                  </p>
                  <p className="text-[11px] text-slate-500">Mitos, verdades e esclarecimentos sobre a doença</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </a>

              <a
                href="https://www.inca.gov.br/sites/ufu.sti.inca.local/files//media/document//dieta_nutricao_atividade_fisica_e_cancer_resumo_do_terceiro_relatorio_de_especialistas_com_uma_perspectiva_brasileira.pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                    Dieta, Nutrição, Atividade Física e Câncer — Terceiro Relatório
                  </p>
                  <p className="text-[11px] text-slate-500">Perspectiva Brasileira pelo INCA e WCRF</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </a>

              <a
                href="https://www.inca.gov.br/publicacoes/livros/o-cancer-e-seus-fatores-de-risco-o-que-educacao-pode-evitar"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                    O Câncer e Seus Fatores de Risco — O que a Educação Pode Evitar
                  </p>
                  <p className="text-[11px] text-slate-500">Publicação educativa do Ministério da Saúde</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
