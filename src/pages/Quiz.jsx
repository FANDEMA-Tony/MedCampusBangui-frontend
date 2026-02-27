import { useState } from 'react';
import { getUser } from '../utils/auth';
import Navbar from '../components/layout/Navbar';
import QuizList from '../components/quiz/QuizList';
import QuizForm from '../components/quiz/QuizForm';
import QuizPassage from '../components/quiz/QuizPassage';
import QuizResultat from '../components/quiz/QuizResultat';

// Vues possibles
const VUES = {
  LISTE:    'liste',
  FORM:     'form',
  PASSAGE:  'passage',
  RESULTAT: 'resultat',
};

export default function Quiz() {
  const user = getUser();
  const role = user?.role;

  const [vue,          setVue]         = useState(VUES.LISTE);
  const [quizSelec,    setQuizSelec]   = useState(null); // quiz sélectionné
  const [quizEdit,     setQuizEdit]    = useState(null); // quiz en édition (null = nouveau)
  const [quizStats,    setQuizStats]   = useState(null); // quiz pour stats

  // ── Handlers navigation ───────────────────────────────────────

  // Étudiant clique sur un quiz → le passer
  // Admin/Enseignant clique sur un quiz → modifier
  const handleSelect = (quiz) => {
    if (role === 'etudiant') {
      setQuizSelec(quiz);
      setVue(VUES.PASSAGE);
    } else {
      setQuizEdit(quiz);
      setVue(VUES.FORM);
    }
  };

  // Nouveau quiz (admin/enseignant)
  const handleNew = () => {
    setQuizEdit(null);
    setVue(VUES.FORM);
  };

  // Voir stats d'un quiz (admin/enseignant)
  const handleStats = (quiz) => {
    setQuizStats(quiz);
    setVue(VUES.RESULTAT);
  };

  // Après sauvegarde formulaire
  const handleSave = () => {
    setQuizEdit(null);
    setVue(VUES.LISTE);
  };

  // Après soumission quiz étudiant
  const handleTermine = () => {
    setQuizSelec(null);
    setVue(VUES.LISTE);
  };

  // Retour à la liste
  const handleRetour = () => {
    setVue(VUES.LISTE);
    setQuizSelec(null);
    setQuizEdit(null);
    setQuizStats(null);
  };

  // ── Vue PASSAGE — plein écran sans Navbar ─────────────────────
  if (vue === VUES.PASSAGE && quizSelec) {
    return (
      <QuizPassage
        quiz={quizSelec}
        onTermine={handleTermine}
        onAnnuler={handleRetour}
      />
    );
  }

  // ── Autres vues — avec Navbar ─────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── LISTE ──────────────────────────────────────────── */}
        {vue === VUES.LISTE && (
          <QuizList
            onSelect={handleSelect}
            onNew={handleNew}
            onStats={handleStats}
          />
        )}

        {/* ── FORMULAIRE ─────────────────────────────────────── */}
        {vue === VUES.FORM && (
          <QuizForm
            quiz={quizEdit}
            onSave={handleSave}
            onCancel={handleRetour}
          />
        )}

        {/* ── STATISTIQUES ───────────────────────────────────── */}
        {vue === VUES.RESULTAT && quizStats && (
          <QuizResultat
            quiz={quizStats}
            onRetour={handleRetour}
          />
        )}
      </div>
    </div>
  );
}