import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Router as WouterRouter, Route, Switch, useLocation } from 'wouter';
import {
  ArrowLeft, BookOpen, CalendarDays, Check, CheckCircle2, ChefHat, ChevronDown,
  Clock3, CookingPot, Leaf, Plus, Search, ShoppingBasket, Trash2, X, Utensils,
  Pencil, RotateCcw, UserRound, ShieldAlert, CircleHelp, RefreshCw, SlidersHorizontal,
} from 'lucide-react';
import {
  type Category, type Recipe, type UserProfile, type WeekPlan, type PlannerData,
  RESTRICTIONS, CUISINES, TIME_OPTIONS, COOKING_STYLES, SUPERMARKETS, PANTRY_OPTIONS,
  loadPlannerData, savePlannerData, loadShoppingChecks, saveShoppingChecks, currentWeekStart,
  getCompatibleRecipes, generateWeeklyProposal, buildShoppingList,
} from './lib/meal-planning';

const CATEGORIES: Category[] = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Snacking'];
const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const MEALS = ['Almoço', 'Jantar'];
const EMPTY_PROFILE: UserProfile = { restrictions: [], cuisines: [], preferredIngredients: [], maxCookTime: '30to60', cookingStyle: 'mixed', pantry: [], supermarket: 'Continente' };
type ReadyPlannerData = Omit<PlannerData, 'profile'> & { profile: UserProfile };
function readOnboarded() {
  try { return localStorage.getItem('prato-a-prato:onboarded') === 'true'; } catch { return false; }
}
function writeOnboarded(value: boolean) {
  try { localStorage.setItem('prato-a-prato:onboarded', String(value)); } catch { /* Continue for this session if storage is unavailable. */ }
}
function initialPlannerData(): ReadyPlannerData {
  const loaded = loadPlannerData();
  return {
    ...loaded,
    profile: { ...EMPTY_PROFILE, ...(loaded.profile ?? {}) },
    weeks: Array.isArray(loaded.weeks) ? loaded.weeks : [],
  };
}
function dateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' }).format(date);
}
function getProposal(data: ReadyPlannerData, start: string): WeekPlan {
  return generateWeeklyProposal(data.recipes, data.profile, data.weeks, start);
}
function menuPreferencesChanged(previous: UserProfile, next: UserProfile) {
  return ['restrictions', 'cuisines', 'preferredIngredients', 'maxCookTime', 'cookingStyle']
    .some((key) => JSON.stringify(previous[key as keyof UserProfile]) !== JSON.stringify(next[key as keyof UserProfile]));
}

function AppShell() {
  const [location, setLocation] = useLocation();
  const [data, setData] = useState<ReadyPlannerData>(initialPlannerData);
  const [checks, setChecks] = useState<Record<string, boolean>>(loadShoppingChecks);
  const [onboarded, setOnboarded] = useState(readOnboarded);
  const [calendarWeek, setCalendarWeek] = useState(currentWeekStart);
  const [step, setStep] = useState(0);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(() => ({ ...EMPTY_PROFILE, ...(loadPlannerData().profile ?? {}) }));
  const [customPantry, setCustomPantry] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [slotPicker, setSlotPicker] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [profileEditing, setProfileEditing] = useState(false);
  const [proposalNotice, setProposalNotice] = useState('');

  const start = calendarWeek;
  useEffect(() => { savePlannerData(data); }, [data]);
  useEffect(() => { saveShoppingChecks(checks); }, [checks]);
  useEffect(() => {
    const updateWeek = () => setCalendarWeek(currentWeekStart());
    const interval = window.setInterval(updateWeek, 60_000);
    window.addEventListener('focus', updateWeek);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', updateWeek); };
  }, []);
  useEffect(() => {
    if (!onboarded) return;
    if (!data.weeks.some((plan) => plan.weekStart === start)) {
      const next = getProposal(data, start);
      setData((old) => ({ ...old, weeks: [...old.weeks, next] }));
    }
  }, [onboarded, data.profile, start]);

  const activePlan = data.weeks.find((plan) => plan.weekStart === start) ?? null;
  const recipes = data.recipes;
  const activePage = location === '/planeador' ? 'planeador' : location === '/compras' ? 'compras' : location === '/perfil' ? 'perfil' : 'receitas';
  const filteredRecipes = useMemo(() => recipes.filter((r) => r.name.toLocaleLowerCase('pt-PT').includes(query.toLocaleLowerCase('pt-PT')) && (categoryFilter === 'Todas' || r.category === categoryFilter)), [recipes, query, categoryFilter]);
  const compatibleIds = useMemo(() => new Set(getCompatibleRecipes(recipes, data.profile, data.weeks, start).map((recipe) => recipe.id)), [recipes, data.profile, data.weeks, start]);
  const incompleteSlots = activePlan ? Object.values(activePlan.slots).filter((id) => !id).length : 14;
  const incompatibleSlots = activePlan ? Object.values(activePlan.slots).filter((id) => !!id && !compatibleIds.has(id)).length : 0;
  const approvalBlocked = incompleteSlots > 0 || incompatibleSlots > 0;
  const approvalHint = incompleteSlots
    ? `Preenche as ${incompleteSlots} refeições sem sugestão antes de aprovar.`
    : incompatibleSlots
      ? 'Troca as refeições que já não respeitam as tuas preferências.'
      : 'A lista de compras só aparece depois da aprovação.';
  const shopping = useMemo(() => {
    if (!activePlan || activePlan.status !== 'approved') return [];
    return buildShoppingList(recipes, activePlan, data.profile, checks).map((item) => ({ ...item, checked: !!checks[item.key] }));
  }, [activePlan, recipes, data.profile, checks]);
  const remaining = shopping.filter((item) => !item.checked).length;
  const total = shopping.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0);
  const slotOptions = slotPicker
    ? getCompatibleRecipesForSlot(recipes, data.profile, data.weeks, slotPicker, start)
      .filter((recipe) => recipe.name.toLocaleLowerCase('pt-PT').includes(pickerSearch.toLocaleLowerCase('pt-PT')) && recipe.id !== activePlan?.slots[slotPicker])
    : [];
  const nav = (path: string) => { setLocation(path); setDetail(null); setFormOpen(false); };
  const openNew = () => { setEditing(null); setFormError(''); setFormOpen(true); };
  const saveRecipe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const ingredients = String(form.get('ingredients') ?? '').split('\n').map((v) => v.trim()).filter(Boolean);
    const steps = String(form.get('steps') ?? '').split('\n').map((v) => v.trim()).filter(Boolean);
    if (!name || !ingredients.length || !steps.length) { setFormError('Preencha o nome, os ingredientes e os passos da receita.'); return; }
    const recipe: Recipe = { ...editing, id: editing?.id ?? `recipe-${Date.now()}`, name, category: String(form.get('category')) as Category, photoUrl: String(form.get('photoUrl') ?? '').trim(), prepTime: Math.max(1, Number(form.get('prepTime')) || 1), ingredients, steps };
    const plannedRecipeChanged = !!editing && !!activePlan && Object.values(activePlan.slots).includes(editing.id);
    setData((old) => {
      const recipes = editing ? old.recipes.map((item) => item.id === editing.id ? recipe : item) : [recipe, ...old.recipes];
      if (!plannedRecipeChanged) return { ...old, recipes };
      const nextPlan = generateWeeklyProposal(recipes, old.profile, old.weeks, start);
      return { ...old, recipes, weeks: [...old.weeks.filter((plan) => plan.weekStart !== start), nextPlan] };
    });
    if (plannedRecipeChanged) {
      setProposalNotice('A receita do plano foi alterada. Revê e aprova a nova proposta.');
      nav('/planeador');
    }
    setFormOpen(false); setEditing(null);
  };
  const deleteRecipe = (recipe: Recipe) => {
    if (!window.confirm(`Remover “${recipe.name}” da sua biblioteca?`)) return;
    const affectsCurrentPlan = !!activePlan && Object.values(activePlan.slots).includes(recipe.id);
    setData((old) => ({
      ...old,
      recipes: old.recipes.filter((r) => r.id !== recipe.id),
      weeks: old.weeks.map((plan) => {
        const slots = Object.fromEntries(Object.entries(plan.slots).map(([key, id]) => [key, id === recipe.id ? null : id]));
        return plan.weekStart === start && affectsCurrentPlan ? { ...plan, slots, status: 'proposed' } : { ...plan, slots };
      }),
    }));
    if (affectsCurrentPlan) {
      setProposalNotice('A receita foi removida do plano. Escolhe uma alternativa e aprova-o novamente.');
      nav('/planeador');
    }
    setDetail(null);
  };
  const assignRecipe = (recipeId: string) => {
    if (!slotPicker || !activePlan || activePlan.status !== 'proposed') return;
    setData((old) => ({ ...old, weeks: old.weeks.map((p) => p.weekStart === start ? { ...p, slots: { ...p.slots, [slotPicker]: recipeId } } : p) }));
    setSlotPicker(null); setPickerSearch('');
  };
  const toggleChoice = (field: 'restrictions' | 'cuisines' | 'pantry', value: string) => setDraftProfile((old) => ({ ...old, [field]: old[field].includes(value) ? old[field].filter((v) => v !== value) : [...old[field], value] }));
  const saveProfile = (finish = false) => {
    const changedMenuPreferences = menuPreferencesChanged(data.profile, draftProfile);
    setData((old) => {
      const updated = { ...old, profile: { ...draftProfile } };
      const hasCurrentPlan = old.weeks.some((plan) => plan.weekStart === start);
      if (finish || changedMenuPreferences || !hasCurrentPlan) {
        updated.weeks = [...old.weeks.filter((plan) => plan.weekStart !== start), getProposal(updated, start)];
      }
      return updated;
    });
    setProfileEditing(false);
    if (finish) { setOnboarded(true); writeOnboarded(true); nav('/planeador'); }
    else if (changedMenuPreferences) {
      setProposalNotice('Preferências guardadas. Revê e aprova a nova proposta.');
      nav('/planeador');
    }
  };
  const approvePlan = () => {
    if (!activePlan) return;
    if (incompleteSlots || incompatibleSlots) {
      setProposalNotice(incompleteSlots
        ? `Preenche as ${incompleteSlots} refeições sem sugestão antes de aprovar.`
        : 'Há refeições incompatíveis com as tuas preferências. Troca-as antes de aprovar.');
      return;
    }
    setData((old) => ({ ...old, weeks: old.weeks.map((p) => p.weekStart === start ? { ...p, status: 'approved' } : p) }));
    setProposalNotice('Plano aprovado. A tua lista de compras está pronta.');
    nav('/compras');
  };

  if (!onboarded || profileEditing) return <Onboarding
    profile={draftProfile} setProfile={setDraftProfile} step={step} setStep={setStep}
    onSave={saveProfile} editing={profileEditing} onCancel={() => { setDraftProfile(data.profile); setProfileEditing(false); }}
    customPantry={customPantry} setCustomPantry={setCustomPantry} toggleChoice={toggleChoice}
  />;

  return <div className="app-shell">
    <header className="topbar"><div className="page-wrap flex items-center justify-between py-3">
      <button className="flex items-center gap-2 border-0 bg-transparent p-0 text-left" onClick={() => nav('/')} data-testid="link-home"><span className="grid size-10 place-items-center rounded-2xl bg-[#e7f0e4] text-[#47764d]"><Leaf size={21} /></span><span><span className="brand-title block text-[1.3rem] font-semibold leading-none text-[#284b34]">Prato a Prato</span><span className="mt-1 block text-[.68rem] tracking-wide text-[#7b8978]">A cozinha da semana, com calma</span></span></button>
      <button onClick={() => { setDraftProfile({ ...data.profile }); setProfileEditing(true); setStep(0); }} className="btn-quiet !min-h-10 !rounded-full !px-3 text-sm" data-testid="button-open-profile"><UserRound size={16} /><span className="hidden sm:inline">Preferências</span></button>
    </div></header>
    <nav className="nav-dock" aria-label="Navegação principal"><div className="nav-dock-inner">
      <button onClick={() => nav('/')} aria-current={activePage === 'receitas' ? 'page' : undefined} className={`nav-item ${activePage === 'receitas' ? 'active' : ''}`} data-testid="nav-receitas"><BookOpen size={19} />Receitas</button>
      <button onClick={() => nav('/planeador')} aria-current={activePage === 'planeador' ? 'page' : undefined} className={`nav-item ${activePage === 'planeador' ? 'active' : ''}`} data-testid="nav-planeador"><CalendarDays size={19} />Plano</button>
      <button onClick={() => nav('/compras')} aria-current={activePage === 'compras' ? 'page' : undefined} className={`nav-item ${activePage === 'compras' ? 'active' : ''}`} data-testid="nav-compras"><ShoppingBasket size={19} />Compras{remaining > 0 && activePlan?.status === 'approved' && <span className="ml-0.5 rounded-full bg-[#dcebd8] px-1.5 text-[.62rem]">{remaining}</span>}</button>
      <button onClick={() => nav('/perfil')} aria-current={activePage === 'perfil' ? 'page' : undefined} className={`nav-item ${activePage === 'perfil' ? 'active' : ''}`} data-testid="nav-perfil"><UserRound size={19} />Perfil</button>
    </div></nav>
    <main className="page-wrap pt-6 sm:pt-9">
      <Switch>
        <Route path="/"><section className="fade-in">
          <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow mb-3">O seu caderno de cozinha</p><h1 className="page-title text-[#294532]">Receitas para<br className="hidden sm:block" /> dias bons.</h1><p className="mt-3 max-w-md text-[.95rem] leading-relaxed text-[#738071]">Guarde os pratos de que gosta e deixe o resto da semana ganhar forma.</p></div><button className="btn-primary self-start sm:self-auto" onClick={openNew} data-testid="button-add-recipe"><Plus size={18} /> Nova receita</button></div>
          <div className="proposal-banner mb-6 flex items-center gap-4 rounded-[22px] p-4 sm:p-5"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-[#598257]"><CookingPot size={24} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-[#38563c]">A semana começa com uma boa ideia.</p><p className="mt-1 text-sm text-[#788674]">{recipes.length} receitas à mão · {Object.values(activePlan?.slots ?? {}).filter(Boolean).length} refeições propostas</p></div><button onClick={() => nav('/planeador')} className="btn-quiet hidden !min-h-10 sm:flex" data-testid="button-open-planner">Ver plano <ArrowLeft className="rotate-180" size={15} /></button></div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#899687]" size={18} /><input aria-label="Pesquisar receitas" className="field pl-11" placeholder="Procurar uma receita..." value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-search-recipes" /></label><div className="relative"><select className="field min-w-44 appearance-none pr-10" aria-label="Filtrar por categoria" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} data-testid="select-category-filter"><option>Todas</option>{CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#788674]" size={16} /></div></div>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-xl font-semibold text-[#36543c]">A sua coleção <span className="ml-1 font-sans text-sm font-normal text-[#859082]">({filteredRecipes.length})</span></h2><span className="text-xs text-[#879183]">Toque para ver a receita</span></div>
          {filteredRecipes.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredRecipes.map((r) => <RecipeCard key={r.id} recipe={r} onOpen={() => setDetail(r)} onEdit={() => { setEditing(r); setFormError(''); setFormOpen(true); }} data-testid={`card-recipe-${r.id}`} />)}</div> : <EmptyState title={recipes.length ? 'Não encontrámos essa receita' : 'O seu caderno está à espera'} description={recipes.length ? 'Experimente outra pesquisa ou categoria.' : 'Comece por guardar um prato que goste de cozinhar.'} icon={<BookOpen size={25} />} action={!recipes.length ? <button className="btn-primary mt-5" onClick={openNew} data-testid="button-empty-add">Adicionar receita</button> : undefined} testId="empty-recipes" />}
        </section></Route>
        <Route path="/planeador"><section className="fade-in">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow mb-3">Sete dias, ao teu ritmo</p><h1 className="page-title text-[#294532]">{activePlan?.status === 'approved' ? 'O teu plano' : 'A proposta da semana'}</h1><p className="mt-3 text-[#738071]">{dateLabel(start)} · almoço e jantar</p></div><span className={`rounded-full px-3 py-2 text-xs font-bold ${activePlan?.status === 'approved' ? 'bg-[#e7f0e4] text-[#47764d]' : 'bg-[#f4eedb] text-[#796943]'}`} data-testid="status-plan">{activePlan?.status === 'approved' ? 'Plano aprovado' : 'À tua espera'}</span></div>
          {activePlan?.status === 'proposed' && <div className="proposal-banner mb-6 rounded-[24px] p-5 sm:p-6"><p className="font-serif text-xl font-semibold leading-snug text-[#35523a]" data-testid="text-proposal-copy">Aqui está a tua proposta de refeições para esta semana. Concordas com este plano?</p><p className="mt-2 text-sm text-[#748271]">Podes trocar qualquer refeição antes de aprovar. As escolhas respeitam as tuas preferências.</p></div>}
          {activePlan && <div className="mb-4 grid gap-3 md:grid-cols-2">{DAYS.map((day, i) => <section key={day} className="card overflow-hidden" data-testid={`plan-day-${i}`}><div className="flex items-center justify-between border-b subtle-line bg-[#fbfcf8] px-4 py-3"><h2 className="font-serif text-lg font-semibold text-[#38543d]">{day}</h2>{i === 0 && <span className="rounded-full bg-[#e8f1e3] px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-wider text-[#557452]">Começo</span>}</div><div className="grid grid-cols-2 divide-x subtle-line">{MEALS.map((meal) => { const key = `${i}-${meal}`; const recipe = recipes.find((r) => r.id === activePlan.slots[key]); return <div key={meal} className="week-slot min-w-0 p-3.5"><span className="mb-2 block text-[.68rem] font-bold uppercase tracking-widest text-[#90998e]">{meal}</span>{recipe ? <div className="flex items-center gap-2"><button onClick={() => setDetail(recipe)} className="min-w-0 flex-1 text-left" data-testid={`planned-recipe-${key}`}><span className="block truncate text-sm font-semibold text-[#38543d]">{recipe.name}</span><span className="mt-1 flex items-center gap-1 text-xs text-[#889283]"><Clock3 size={12} />{recipe.prepTime} min</span></button>{activePlan.status === 'proposed' && <button className="icon-button !size-8 !border-0 !bg-[#f4f6f0]" title="Trocar refeição" aria-label={`Trocar ${meal.toLowerCase()} de ${day}`} onClick={() => { setSlotPicker(key); setPickerSearch(''); }} data-testid={`button-replace-${key}`}><Pencil size={14} /></button>}</div> : <div className="flex flex-col items-start gap-2"><span className="text-xs text-[#9a8170]">Sem sugestão compatível</span>{activePlan.status === 'proposed' && <button type="button" className="btn-quiet !min-h-8 !px-2.5 !py-1 text-xs" onClick={() => { setSlotPicker(key); setPickerSearch(''); }} aria-label={`Escolher ${meal.toLowerCase()} para ${day}`} data-testid={`button-choose-${key}`}><Plus size={14} /> Escolher</button>}</div>}</div>})}</div></section>)}</div>}
          {activePlan?.status === 'proposed' ? <div className="sticky bottom-20 z-10 mt-5 flex flex-col gap-3 rounded-2xl border border-[#e0e8da] bg-[#fbfcf8]/95 p-4 shadow-sm backdrop-blur sm:static sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-[#748271]" role="status" data-testid="text-approval-hint">{approvalHint}</span><button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" onClick={approvePlan} disabled={approvalBlocked} data-testid="button-approve-plan"><CheckCircle2 size={18} /> Aprovar plano</button></div> : <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#edf4e9] p-4"><p className="text-sm text-[#557452]">Este plano já está aprovado. A lista de compras está pronta.</p><button className="btn-quiet" onClick={() => nav('/compras')} data-testid="button-view-shopping"><ShoppingBasket size={16} /> Ver compras</button></div>}
        </section></Route>
        <Route path="/compras"><section className="fade-in">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Tudo o que falta trazer</p><h1 className="page-title text-[#294532]">Lista de compras</h1><p className="mt-3 text-[#738071]">A partir do teu plano aprovado para esta semana.</p></div>{shopping.length > 0 && <button onClick={() => setChecks({})} className="btn-quiet" data-testid="button-uncheck-all"><RotateCcw size={16} /> Desmarcar tudo</button>}</div>
          {activePlan?.status === 'approved' ? <>
            <div className="proposal-banner mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[22px] p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white/80 text-[#598257]"><ShoppingBasket size={22} /></span><div><p className="font-semibold text-[#38563c]">Supermercado preferido</p><p className="text-sm text-[#788674]" data-testid="text-supermarket">{data.profile.supermarket}</p></div></div><div className="text-right"><p className="text-xs uppercase tracking-wider text-[#7b8978]">Estimativa total</p><p className="font-serif text-2xl font-semibold text-[#36543c]" data-testid="text-shopping-total">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(total)}</p></div></div>
            {shopping.length ? <>
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f2f5ee] px-4 py-3"><span className="font-semibold text-[#38563c]" data-testid="text-shopping-progress">{remaining === 0 ? 'Tudo tratado. Boa ida às compras.' : `Faltam ${remaining} ${remaining === 1 ? 'ingrediente' : 'ingredientes'}.`}</span><span className="text-sm text-[#788674]">{shopping.length} itens</span></div>
              <div className="card divide-y divide-[#edf0e9] overflow-hidden">{shopping.map((item, index) => <label key={item.key} className={`flex min-h-[64px] cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#fbfcf8] ${checks[item.key] ? 'opacity-55' : ''}`} data-testid={`shopping-item-${index}`}><input type="checkbox" className="peer sr-only" checked={!!checks[item.key]} onChange={(e) => setChecks((old) => ({ ...old, [item.key]: e.target.checked }))} data-testid={`checkbox-shopping-${index}`} /><span className={`grid size-6 shrink-0 place-items-center rounded-lg border ${checks[item.key] ? 'border-[#5b8058] bg-[#5b8058] text-white' : 'border-[#cbd6c7] bg-white text-transparent'}`}><Check size={15} /></span><span className={`flex-1 text-sm font-medium text-[#3f5141] ${checks[item.key] ? 'line-through' : ''}`}>{item.name}{item.quantity && <span className="ml-2 text-xs text-[#84907f]">{item.quantity}</span>}{item.count > 1 && <span className="ml-2 text-xs text-[#84907f]">× {item.count}</span>}</span><span className="price-tag px-2.5 py-1 text-xs font-semibold" data-testid={`text-price-${index}`}>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(item.estimatedPrice) || 0)}</span></label>)}</div>
              <p className="mt-4 rounded-xl px-1 text-xs leading-relaxed text-[#899386]" data-testid="text-price-note">Os preços são estimativas aproximadas e não correspondem a preços em tempo real. Podem variar consoante a loja e a região.</p>
              <div className="safety-note mt-3 flex gap-2 rounded-xl p-3 text-xs leading-relaxed text-[#736442]" data-testid="text-allergen-safety"><ShieldAlert className="mt-0.5 shrink-0" size={16} />A correspondência de alergénios usa o texto dos ingredientes. Confirma sempre os rótulos dos produtos e a possibilidade de contaminação cruzada.</div>
            </> : <EmptyState title="A despensa já tem tudo" description="As receitas aprovadas não precisam de ingredientes adicionais." icon={<CheckCircle2 size={25} />} testId="empty-shopping" />}
          </> : <EmptyState title="A lista começa depois da aprovação" description="Revê a proposta semanal e aprova o plano para gerar uma lista de compras inteligente." icon={<ShoppingBasket size={25} />} action={<button className="btn-primary mt-5" onClick={() => nav('/planeador')} data-testid="button-empty-to-planner"><CalendarDays size={17} /> Rever proposta</button>} testId="empty-shopping" />}
        </section></Route>
        <Route path="/perfil"><ProfileView profile={data.profile} onEdit={() => { setDraftProfile({ ...data.profile }); setProfileEditing(true); setStep(0); }} data-testid="profile-view" /></Route>
        <Route><section className="card p-8 text-center"><h1 className="font-serif text-2xl">Página não encontrada</h1><button className="btn-primary mt-4" onClick={() => nav('/')}>Voltar às receitas</button></section></Route>
      </Switch>
    </main>
    <footer className="page-wrap py-8 text-center text-xs text-[#97a092]">Feito com cuidado, para a tua cozinha.</footer>
    {proposalNotice && <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#315f43] px-5 py-3 text-sm font-semibold text-white shadow-lg" role="status" data-testid="status-plan-approved">{proposalNotice}<button className="ml-3" aria-label="Fechar aviso" onClick={() => setProposalNotice('')}><X size={14} /></button></div>}
    {formOpen && <RecipeForm recipe={editing} error={formError} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveRecipe} />}
    {detail && <RecipeDetail recipe={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); setFormError(''); setFormOpen(true); }} onDelete={() => deleteRecipe(detail)} />}
    {slotPicker && activePlan && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSlotPicker(null); }}><div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="picker-title"><div className="flex items-center justify-between border-b border-[#edf0e9] p-5"><div><p className="eyebrow mb-1">Escolher alternativa compatível</p><h2 id="picker-title" className="font-serif text-2xl font-semibold text-[#294532]">Trocar refeição</h2></div><button className="icon-button" onClick={() => setSlotPicker(null)} aria-label="Fechar" data-testid="button-close-picker"><X size={19} /></button></div><div className="p-5"><label className="relative mb-4 block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#899687]" size={17} /><input className="field pl-10" placeholder="Pesquisar receitas..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} data-testid="input-picker-search" /></label><div className="max-h-[50dvh] space-y-2 overflow-y-auto">{slotOptions.length ? slotOptions.map((r) => <button key={r.id} onClick={() => assignRecipe(r.id)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e8ede5] p-2.5 text-left hover:bg-[#f6f8f3]" data-testid={`button-pick-${r.id}`}><RecipeThumb recipe={r} className="size-14 rounded-xl" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-[#3a513d]">{r.name}</span><span className="mt-1 block text-xs text-[#889283]">{r.category} · {r.prepTime} min</span></span><RefreshCw className="mr-2 text-[#658261]" size={17} /></button>) : <div className="py-5 text-center"><p className="text-sm text-[#7b8678]">{pickerSearch ? 'Não encontrámos essa receita.' : 'Ainda não há outra receita compatível para esta refeição.'}</p>{!pickerSearch && <button className="btn-quiet mt-4" onClick={() => { setSlotPicker(null); nav('/'); }}>Abrir livro de receitas</button>}</div>}</div></div></div></div>}
  </div>;
}

function getCompatibleRecipesForSlot(recipes: Recipe[], profile: UserProfile, weeks: WeekPlan[], slot: string, start: string) {
  const meal = slot.split('-').slice(1).join('-');
  const category = meal as Category;
  return getCompatibleRecipes(recipes, profile, weeks, start).filter((recipe) => recipe.category === category);
}

function Onboarding({ profile, setProfile, step, setStep, onSave, editing, onCancel, customPantry, setCustomPantry, toggleChoice }: {
  profile: UserProfile; setProfile: (profile: UserProfile | ((old: UserProfile) => UserProfile)) => void;
  step: number; setStep: (step: number) => void; onSave: (finish?: boolean) => void;
  editing: boolean; onCancel: () => void; customPantry: string; setCustomPantry: (value: string) => void;
  toggleChoice: (field: 'restrictions' | 'cuisines' | 'pantry', value: string) => void;
}) {
  const titles = ['O que devemos evitar?', 'Que sabores gostas?', 'O teu ritmo na cozinha', 'O que já tens na despensa?', 'Onde costumas fazer compras?'];
  const next = () => step < 4 ? setStep(step + 1) : onSave(!editing);
  const previous = () => step > 0 ? setStep(step - 1) : editing ? onCancel() : undefined;
  const choices = (values: readonly string[], field: 'restrictions' | 'cuisines' | 'pantry') => <div className="flex flex-wrap gap-2.5">{values.map((value) => <button type="button" key={value} onClick={() => toggleChoice(field, value)} className={`choice-chip ${profile[field].includes(value) ? 'selected' : ''}`} aria-pressed={profile[field].includes(value)} data-testid={`choice-${field}-${slug(value)}`}>{profile[field].includes(value) && <Check size={15} />}{value}</button>)}</div>;
  return <div className="onboarding-shell px-3 py-6 sm:px-6 sm:py-10">
    <header className="mx-auto mb-6 flex w-full max-w-[760px] items-center justify-between"><div className="flex items-center gap-2"><span className="grid size-10 place-items-center rounded-2xl bg-[#e7f0e4] text-[#47764d]"><Leaf size={21} /></span><span className="brand-title text-xl font-semibold text-[#284b34]">Prato a Prato</span></div>{editing ? <button className="icon-button" onClick={onCancel} aria-label="Fechar perfil" data-testid="button-cancel-profile"><X size={18} /></button> : <span className="text-xs text-[#82907e]">Os teus dados ficam neste dispositivo</span>}</header>
    <main className="onboarding-card mx-auto p-5 sm:p-9">
      <div className="mb-8"><div className="mb-5 flex items-center justify-between gap-2">{titles.map((title, i) => <span className={`step-chip ${step === i ? 'current' : ''} grid size-8 place-items-center rounded-full text-xs font-bold`} key={title} aria-label={`Passo ${i + 1}`} data-testid={`step-indicator-${i}`}>{i + 1}</span>)}</div><p className="eyebrow mb-2">{editing ? 'As tuas preferências' : `Passo ${step + 1} de ${titles.length}`}</p><h1 className="font-serif text-3xl font-semibold leading-tight text-[#294532]" data-testid="text-onboarding-title">{editing ? 'Afinar o teu perfil' : titles[step]}</h1><p className="mt-2 max-w-lg text-sm leading-relaxed text-[#788674]">{['Diz-nos o que não deve entrar no prato. A segurança alimentar continua a depender dos rótulos.', 'Escolhe cozinhas que te dão vontade de sentar à mesa.', 'A proposta ajusta o tempo de preparação e o modo como organizas as refeições.', 'Assinala os ingredientes que já tens. Serão excluídos da lista de compras.', 'Vamos usar esta preferência apenas para apresentar a tua loja na lista.'][step]}</p></div>
      {step === 0 && <section data-testid="onboarding-restrictions"><h2 className="field-label mb-3">Restrições, alergias e escolhas alimentares</h2>{choices(RESTRICTIONS, 'restrictions')}<div className="safety-note mt-5 flex gap-2 rounded-xl p-3 text-xs leading-relaxed text-[#736442]"><ShieldAlert className="mt-0.5 shrink-0" size={16} />A deteção compara palavras nos ingredientes. Verifica sempre os rótulos e a contaminação cruzada.</div></section>}
      {step === 1 && <section data-testid="onboarding-cuisines"><h2 className="field-label mb-3">Cozinhas preferidas</h2>{choices(CUISINES, 'cuisines')}<div className="mt-6"><label className="field-label" htmlFor="preferred-ingredients">Ingredientes de que gostas (opcional)</label><input id="preferred-ingredients" className="field" value={profile.preferredIngredients.join(', ')} onChange={(e) => setProfile((old) => ({ ...old, preferredIngredients: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) }))} placeholder="Ex.: tomate, grão, limão" data-testid="input-preferred-ingredients" /></div></section>}
      {step === 2 && <section className="space-y-7" data-testid="onboarding-cooking"><div><h2 className="field-label mb-3">Quanto tempo tens?</h2><div className="profile-grid">{TIME_OPTIONS.map((option) => <button type="button" key={option.value} onClick={() => setProfile((old) => ({ ...old, maxCookTime: option.value }))} className={`choice-chip !min-h-[68px] !justify-start !rounded-2xl ${profile.maxCookTime === option.value ? 'selected' : ''}`} aria-pressed={profile.maxCookTime === option.value} data-testid={`choice-time-${option.value}`}><Clock3 size={18} /><span className="flex flex-col items-start"><span>{option.label}</span><span className="text-xs font-normal opacity-75">{option.description}</span></span></button>)}</div></div><div><h2 className="field-label mb-3">Como gostas de cozinhar?</h2><div className="profile-grid">{COOKING_STYLES.map((option) => <button type="button" key={option.value} onClick={() => setProfile((old) => ({ ...old, cookingStyle: option.value }))} className={`choice-chip !min-h-[68px] !justify-start !rounded-2xl ${profile.cookingStyle === option.value ? 'selected' : ''}`} aria-pressed={profile.cookingStyle === option.value} data-testid={`choice-style-${option.value}`}><CookingPot size={18} /><span className="flex flex-col items-start"><span>{option.label}</span><span className="text-xs font-normal opacity-75">{option.description}</span></span></button>)}</div></div></section>}
      {step === 3 && <section data-testid="onboarding-pantry"><h2 className="field-label mb-3">O que tens por casa?</h2>{choices(PANTRY_OPTIONS, 'pantry')}<div className="mt-6"><label className="field-label" htmlFor="custom-pantry">Adicionar outro ingrediente</label><div className="flex gap-2"><input id="custom-pantry" className="field" value={customPantry} onChange={(e) => setCustomPantry(e.target.value)} placeholder="Ex.: leite de coco" data-testid="input-custom-pantry" /><button className="btn-primary !px-3" type="button" onClick={() => { const value = customPantry.trim(); if (value && !profile.pantry.includes(value)) setProfile((old) => ({ ...old, pantry: [...old.pantry, value] })); setCustomPantry(''); }} aria-label="Adicionar ingrediente à despensa" data-testid="button-add-pantry"><Plus size={18} /></button></div>{profile.pantry.filter((item) => !(PANTRY_OPTIONS as readonly string[]).includes(item)).map((item) => <button type="button" className="choice-chip selected mt-3 mr-2" onClick={() => toggleChoice('pantry', item)} key={item} data-testid={`custom-pantry-${slug(item)}`}>{item}<X size={14} /></button>)}</div></section>}
      {step === 4 && <section data-testid="onboarding-supermarket"><h2 className="field-label mb-3">O teu supermercado habitual</h2><div className="profile-grid">{SUPERMARKETS.map((market) => <button type="button" key={market} onClick={() => setProfile((old) => ({ ...old, supermarket: market }))} className={`choice-chip !min-h-[58px] !justify-start !rounded-2xl ${profile.supermarket === market ? 'selected' : ''}`} aria-pressed={profile.supermarket === market} data-testid={`choice-supermarket-${slug(market)}`}>{profile.supermarket === market ? <CheckCircle2 size={18} /> : <ShoppingBasket size={18} />}{market}</button>)}</div><p className="mt-5 text-xs leading-relaxed text-[#82907e]"><CircleHelp className="mr-1 inline" size={14} />Os preços apresentados são estimativas orientativas e não são atualizados em tempo real.</p></section>}
      <div className="mt-9 flex flex-col-reverse justify-between gap-3 border-t border-[#edf0e9] pt-5 sm:flex-row"><button className="btn-quiet disabled:cursor-not-allowed disabled:opacity-40" onClick={previous} disabled={step === 0 && !editing} data-testid="button-onboarding-back">{step === 0 ? (editing ? 'Cancelar' : 'Anterior') : 'Anterior'}</button><button className="btn-primary" onClick={next} data-testid="button-onboarding-next">{step === 4 ? (editing ? 'Guardar preferências' : 'Criar a minha proposta') : 'Continuar'} <ArrowLeft className="rotate-180" size={16} /></button></div>
    </main><p className="mx-auto mt-5 max-w-[760px] text-center text-xs text-[#899386]">Tudo permanece privado e guardado no teu dispositivo.</p>
  </div>;
}
function slug(value: string) { return value.toLocaleLowerCase('pt-PT').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function ProfileView({ profile, onEdit }: { profile: UserProfile; onEdit: () => void; 'data-testid'?: string }) {
  const sections = [
    ['Evitar / restrições', profile.restrictions],
    ['Cozinhas preferidas', profile.cuisines],
    ['Ingredientes preferidos', profile.preferredIngredients],
    ['Despensa', profile.pantry],
    ['Tempo para cozinhar', [TIME_OPTIONS.find((x) => x.value === profile.maxCookTime)?.label ?? profile.maxCookTime]],
    ['Estilo de preparação', [COOKING_STYLES.find((x) => x.value === profile.cookingStyle)?.label ?? profile.cookingStyle]],
    ['Supermercado', [profile.supermarket]],
  ];
  return <section className="fade-in" data-testid="profile-view"><div className="mb-7 flex items-end justify-between gap-3"><div><p className="eyebrow mb-3">Preferências locais</p><h1 className="page-title text-[#294532]">O teu perfil</h1><p className="mt-3 text-[#738071]">Ajusta as escolhas que orientam a proposta semanal.</p></div><button className="btn-primary" onClick={onEdit} data-testid="button-edit-profile"><SlidersHorizontal size={17} /> Editar</button></div><div className="grid gap-3 sm:grid-cols-2">{sections.map(([title, values]) => <article className="card p-5" key={title as string}><h2 className="mb-3 font-serif text-lg font-semibold text-[#38543d]">{title}</h2><div className="flex flex-wrap gap-2">{(values as string[]).length ? (values as string[]).map((value) => <span className="rounded-full bg-[#edf4e9] px-3 py-1.5 text-sm text-[#557452]" key={value}>{value}</span>) : <span className="text-sm text-[#899386]">Sem preferências definidas</span>}</div></article>)}</div><div className="safety-note mt-5 flex gap-2 rounded-xl p-3 text-xs leading-relaxed text-[#736442]"><ShieldAlert className="mt-0.5 shrink-0" size={16} />A correspondência de alergénios usa o texto dos ingredientes. Verifica sempre rótulos e contaminação cruzada.</div></section>;
}
function EmptyState({ title, description, icon, action, testId }: { title: string; description: string; icon: ReactNode; action?: ReactNode; testId: string }) {
  return <div className="card flex flex-col items-center px-6 py-12 text-center" data-testid={testId}><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#eff4ea] text-[#668263]">{icon}</span><h2 className="font-serif text-xl font-semibold text-[#36543c]">{title}</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#7b8678]">{description}</p>{action}</div>;
}
function RecipeThumb({ recipe, className = '' }: { recipe: Recipe; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!recipe.photoUrl || failed) return <div className={`recipe-image grid shrink-0 place-items-center text-[#72906c] ${className}`}><Utensils size={22} /></div>;
  return <img className={`recipe-image shrink-0 ${className}`} src={recipe.photoUrl} alt={recipe.name} onError={() => setFailed(true)} loading="lazy" data-testid={`img-recipe-${recipe.id}`} />;
}
function RecipeCard({ recipe, onOpen, onEdit, ...props }: { recipe: Recipe; onOpen: () => void; onEdit: () => void; 'data-testid'?: string }) {
  return <article className="card group overflow-hidden transition-transform duration-200 hover:-translate-y-1" {...props}><button className="block w-full text-left" onClick={onOpen} data-testid={`button-open-${recipe.id}`}><div className="relative h-44 overflow-hidden"><RecipeThumb recipe={recipe} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[.68rem] font-bold text-[#52704e] shadow-sm">{recipe.category}</span></div><div className="px-4 pb-4 pt-3"><h3 className="font-serif text-xl font-semibold leading-tight text-[#36513b]">{recipe.name}</h3><span className="mt-2.5 flex items-center gap-1.5 text-xs text-[#879183]"><Clock3 size={14} /> {recipe.prepTime} min <span className="mx-1">·</span>{recipe.ingredients.length} ingredientes</span></div></button><div className="flex items-center justify-between border-t border-[#f0f2ec] px-4 py-2"><span className="flex items-center gap-1.5 text-xs font-semibold text-[#71866e]"><ChefHat size={14} /> Para fazer em casa</span><button onClick={onEdit} className="rounded-lg p-2 text-[#788674] hover:bg-[#f0f4ec]" aria-label={`Editar ${recipe.name}`} data-testid={`button-edit-${recipe.id}`}><Pencil size={15} /></button></div></article>;
}
function RecipeForm({ recipe, error, onClose, onSubmit }: { recipe: Recipe | null; error: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-sheet large" role="dialog" aria-modal="true" aria-labelledby="recipe-form-title"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0e9] bg-[#fbfcf8]/95 p-5 backdrop-blur"><div><p className="eyebrow mb-1">{recipe ? 'Atualizar caderno' : 'Uma nova favorita'}</p><h2 id="recipe-form-title" className="font-serif text-2xl font-semibold text-[#294532]">{recipe ? 'Editar receita' : 'Nova receita'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar formulário" data-testid="button-close-form"><X size={19} /></button></div><form onSubmit={onSubmit} className="space-y-4 p-5"><div><label className="field-label" htmlFor="recipe-name">Nome da receita</label><input className="field" id="recipe-name" name="name" defaultValue={recipe?.name} placeholder="Ex.: Massa de domingo" required data-testid="input-recipe-name" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]"><div><label className="field-label" htmlFor="recipe-category">Categoria</label><select className="field" id="recipe-category" name="category" defaultValue={recipe?.category ?? 'Almoço'} data-testid="select-recipe-category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div><div><label className="field-label" htmlFor="recipe-time">Tempo (min)</label><input className="field" id="recipe-time" name="prepTime" type="number" min="1" defaultValue={recipe?.prepTime ?? 25} data-testid="input-recipe-time" /></div></div><div><label className="field-label" htmlFor="recipe-photo">URL da fotografia <span className="font-normal text-[#91998e]">(opcional)</span></label><input className="field" id="recipe-photo" name="photoUrl" type="url" defaultValue={recipe?.photoUrl} placeholder="https://..." data-testid="input-recipe-photo" /></div><div><label className="field-label" htmlFor="recipe-ingredients">Ingredientes — um por linha</label><textarea className="field min-h-28 resize-y" id="recipe-ingredients" name="ingredients" defaultValue={recipe?.ingredients.join('\n')} placeholder={'2 tomates maduros\n1 cebola\nAzeite'} required data-testid="textarea-recipe-ingredients" /></div><div><label className="field-label" htmlFor="recipe-steps">Preparação — um passo por linha</label><textarea className="field min-h-32 resize-y" id="recipe-steps" name="steps" defaultValue={recipe?.steps.join('\n')} required data-testid="textarea-recipe-steps" /></div>{error && <p className="rounded-xl bg-[#fbefec] p-3 text-sm text-[#9b5147]" role="alert" data-testid="status-form-error">{error}</p>}<div className="flex flex-col-reverse gap-2 border-t border-[#edf0e9] pt-4 sm:flex-row sm:justify-end"><button type="button" className="btn-quiet" onClick={onClose} data-testid="button-cancel-recipe">Cancelar</button><button type="submit" className="btn-primary" data-testid="button-save-recipe"><Check size={17} /> {recipe ? 'Guardar alterações' : 'Guardar receita'}</button></div></form></div></div>;
}
function RecipeDetail({ recipe, onClose, onEdit, onDelete }: { recipe: Recipe; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><article className="modal-sheet large" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title"><div className="relative h-52 sm:h-64"><RecipeThumb recipe={recipe} className="h-full w-full" /><button onClick={onClose} className="icon-button absolute right-4 top-4 border-white/80 bg-white/90" aria-label="Fechar receita" data-testid="button-close-detail"><X size={19} /></button><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#52704e]">{recipe.category}</span></div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="recipe-detail-title" className="font-serif text-3xl font-semibold leading-tight text-[#294532]" data-testid={`text-recipe-title-${recipe.id}`}>{recipe.name}</h2><span className="mt-2 flex items-center gap-1.5 text-sm text-[#879183]"><Clock3 size={15} /> {recipe.prepTime} minutos</span></div><div className="flex gap-2"><button className="btn-quiet !min-h-10 !px-3" onClick={onEdit} data-testid="button-detail-edit"><Pencil size={15} /> Editar</button><button className="icon-button !size-10 text-[#a06459]" onClick={onDelete} aria-label="Eliminar receita" data-testid="button-delete-recipe"><Trash2 size={17} /></button></div></div><div className="mt-7 grid gap-7 sm:grid-cols-[.8fr_1.2fr]"><section><h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-[#3b593f]"><ShoppingBasket size={18} /> Ingredientes</h3><ul className="space-y-2.5">{recipe.ingredients.map((x, i) => <li key={`${x}-${i}`} className="flex gap-2 text-sm leading-relaxed text-[#5d6c5e]" data-testid={`text-ingredient-${i}`}><span className="mt-[.55rem] size-1.5 shrink-0 rounded-full bg-[#8ba080]" />{x}</li>)}</ul></section><section><h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-[#3b593f]"><CookingPot size={18} /> Preparação</h3><ol className="space-y-3">{recipe.steps.map((x, i) => <li key={`${x}-${i}`} className="flex gap-3 text-sm leading-relaxed text-[#5d6c5e]" data-testid={`text-step-${i}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3e8] text-xs font-bold text-[#60805b]">{i + 1}</span>{x}</li>)}</ol></section></div></div></article></div>;
}
function App() {
  useEffect(() => { if ('serviceWorker' in navigator) { const base = import.meta.env.BASE_URL || '/'; window.addEventListener('load', () => { navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => undefined); }, { once: true }); } }, []);
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppShell /></WouterRouter>;
}
export default App;
