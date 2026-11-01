import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowLeft, BookOpen, CalendarDays, Check, CheckCircle2, ChefHat, ChevronDown,
  Clock3, CookingPot, Leaf, Plus, Search, ShoppingBasket, Trash2,
  X, Utensils, Pencil, RotateCcw,
} from 'lucide-react';

type Category = 'Pequeno-almoço' | 'Almoço' | 'Jantar' | 'Snacking';
type Recipe = {
  id: string; name: string; category: Category; photoUrl: string;
  prepTime: number; ingredients: string[]; steps: string[];
};
type Slot = { recipeId: string | null };
type Plan = Record<string, Slot>;
type ShoppingItem = { key: string; name: string; checked: boolean; count: number };

const STORE = { recipes: 'prato-a-prato:recipes', plan: 'prato-a-prato:plan', checked: 'prato-a-prato:checked' };
const CATEGORIES: Category[] = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Snacking'];
const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const initialRecipes: Recipe[] = [
  { id: 'r1', name: 'Tosta de abacate e ovo', category: 'Pequeno-almoço', photoUrl: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 15, ingredients: ['2 fatias de pão de fermentação lenta', '1 abacate maduro', '2 ovos', '1 limão', 'Pimenta preta', 'Sal'], steps: ['Tostar o pão até ficar dourado.', 'Esmagar o abacate com umas gotas de limão, sal e pimenta.', 'Estrelar os ovos e servir sobre o pão com o abacate.'] },
  { id: 'r2', name: 'Salada morna de grão e abóbora', category: 'Almoço', photoUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 35, ingredients: ['400 g de grão-de-bico cozido', '300 g de abóbora', '100 g de espinafres', '1 cebola roxa', '2 colheres de azeite', '1 colher de tahini', '1 limão'], steps: ['Cortar a abóbora em cubos e assar com azeite durante 25 minutos.', 'Aquecer o grão numa frigideira com a cebola laminada.', 'Juntar os espinafres e envolver até murcharem.', 'Servir com a abóbora e molho de tahini e limão.'] },
  { id: 'r3', name: 'Arroz de tomate com ovo', category: 'Jantar', photoUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 30, ingredients: ['250 g de arroz carolino', '3 tomates maduros', '1 cebola', '2 dentes de alho', '4 ovos', '750 ml de caldo de legumes', 'Coentros frescos'], steps: ['Refogar a cebola e o alho picados num fio de azeite.', 'Juntar o tomate em cubos e deixar apurar.', 'Adicionar o arroz e o caldo quente. Cozinhar até ficar cremoso.', 'Escalfar os ovos no arroz e terminar com coentros.'] },
  { id: 'r4', name: 'Iogurte com pêra e nozes', category: 'Pequeno-almoço', photoUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 8, ingredients: ['2 iogurtes naturais', '1 pêra', '30 g de nozes', '2 colheres de mel', 'Canela'], steps: ['Cortar a pêra em fatias finas.', 'Distribuir o iogurte por duas taças.', 'Juntar a pêra, as nozes, o mel e uma pitada de canela.'] },
  { id: 'r5', name: 'Sopa de legumes da horta', category: 'Jantar', photoUrl: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 40, ingredients: ['2 cenouras', '1 curgete', '1 alho-francês', '2 batatas', '1,2 l de água', 'Azeite', 'Sal'], steps: ['Lavar e cortar os legumes em pedaços.', 'Cozer tudo em água com sal durante 30 minutos.', 'Triturar até obter uma sopa cremosa e finalizar com azeite.'] },
  { id: 'r6', name: 'Bolachas de aveia e banana', category: 'Snacking', photoUrl: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', prepTime: 25, ingredients: ['2 bananas maduras', '120 g de flocos de aveia', '1 colher de manteiga de amendoim', 'Canela'], steps: ['Esmagar as bananas e misturar com a aveia e a manteiga de amendoim.', 'Moldar pequenas bolachas num tabuleiro.', 'Levar ao forno a 180 °C durante 15 minutos.'] },
];

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}
function makePlan(): Plan {
  const plan: Plan = {};
  DAYS.forEach((_, day) => ['Almoço', 'Jantar'].forEach((meal) => { plan[`${day}-${meal}`] = { recipeId: null }; }));
  return plan;
}
function norm(value: string) { return value.trim().toLocaleLowerCase('pt-PT').replace(/\s+/g, ' '); }
function AppShell() {
  const [location, setLocation] = useLocation();
  const [recipes, setRecipes] = useState<Recipe[]>(() => readStore(STORE.recipes, initialRecipes));
  const [plan, setPlan] = useState<Plan>(() => ({ ...makePlan(), ...readStore(STORE.plan, {}) }));
  const [checked, setChecked] = useState<Record<string, boolean>>(() => readStore(STORE.checked, {}));
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [slotPicker, setSlotPicker] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { try { localStorage.setItem(STORE.recipes, JSON.stringify(recipes)); } catch { /* armazenamento indisponível */ } }, [recipes]);
  useEffect(() => { try { localStorage.setItem(STORE.plan, JSON.stringify(plan)); } catch { /* armazenamento indisponível */ } }, [plan]);
  useEffect(() => { try { localStorage.setItem(STORE.checked, JSON.stringify(checked)); } catch { /* armazenamento indisponível */ } }, [checked]);

  const activePage = location === '/planeador' ? 'planeador' : location === '/compras' ? 'compras' : 'receitas';
  const plannedShopping = useMemo(() => {
    const merged = new Map<string, ShoppingItem>();
    Object.values(plan).forEach((slot) => {
      const recipe = recipes.find((item) => item.id === slot.recipeId);
      recipe?.ingredients.forEach((ingredient) => {
        const key = norm(ingredient);
        const current = merged.get(key);
        if (current) current.count += 1;
        else merged.set(key, { key, name: ingredient.trim(), checked: false, count: 1 });
      });
    });
    return Array.from(merged.values()).map((item) => ({ ...item, checked: !!checked[item.key] }));
  }, [plan, recipes, checked]);
  const remaining = plannedShopping.filter((item) => !item.checked).length;

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLocaleLowerCase('pt-PT').includes(query.toLocaleLowerCase('pt-PT')) &&
    (categoryFilter === 'Todas' || recipe.category === categoryFilter),
  );
  const nav = (path: string) => { setLocation(path); setDetail(null); setFormOpen(false); };
  const openNew = () => { setEditing(null); setFormError(''); setFormOpen(true); };
  const saveRecipe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const ingredients = String(data.get('ingredients') ?? '').split('\n').map((v) => v.trim()).filter(Boolean);
    const steps = String(data.get('steps') ?? '').split('\n').map((v) => v.trim()).filter(Boolean);
    if (!name || ingredients.length === 0 || steps.length === 0) { setFormError('Preencha o nome, os ingredientes e os passos da receita.'); return; }
    const recipe: Recipe = {
      id: editing?.id ?? `recipe-${Date.now()}`,
      name, category: String(data.get('category')) as Category,
      photoUrl: String(data.get('photoUrl') ?? '').trim(),
      prepTime: Math.max(1, Number(data.get('prepTime')) || 1), ingredients, steps,
    };
    setRecipes((old) => editing ? old.map((item) => item.id === editing.id ? recipe : item) : [recipe, ...old]);
    setFormOpen(false); setEditing(null);
  };
  const deleteRecipe = (recipe: Recipe) => {
    if (!window.confirm(`Remover “${recipe.name}” da sua biblioteca?`)) return;
    setRecipes((old) => old.filter((item) => item.id !== recipe.id));
    setPlan((old) => Object.fromEntries(Object.entries(old).map(([key, slot]) => [key, slot.recipeId === recipe.id ? { recipeId: null } : slot])));
    setDetail(null);
  };
  const assignRecipe = (recipeId: string | null) => {
    if (!slotPicker) return;
    setPlan((old) => ({ ...old, [slotPicker]: { recipeId } }));
    setSlotPicker(null); setPickerSearch('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="page-wrap flex items-center justify-between py-3">
          <button className="flex items-center gap-2 border-0 bg-transparent p-0 text-left" onClick={() => nav('/')} data-testid="link-home">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#e7f0e4] text-[#47764d]"><Leaf size={21} /></span>
            <span><span className="brand-title block text-[1.3rem] font-semibold leading-none text-[#284b34]">Prato a Prato</span><span className="mt-1 block text-[.68rem] tracking-wide text-[#7b8978]">A cozinha da semana, com calma</span></span>
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#f0f4ec] px-3 py-2 text-xs font-semibold text-[#557452] sm:flex"><CheckCircle2 size={15} /> Tudo guardado neste dispositivo</span>
        </div>
      </header>

      <nav className="nav-dock" aria-label="Navegação principal">
        <div className="nav-dock-inner">
          <button onClick={() => nav('/')} aria-current={activePage === 'receitas' ? 'page' : undefined} className={`nav-item ${activePage === 'receitas' ? 'active' : ''}`} data-testid="nav-receitas"><BookOpen size={19} />Receitas</button>
          <button onClick={() => nav('/planeador')} aria-current={activePage === 'planeador' ? 'page' : undefined} className={`nav-item ${activePage === 'planeador' ? 'active' : ''}`} data-testid="nav-planeador"><CalendarDays size={19} />Planeador</button>
          <button onClick={() => nav('/compras')} aria-current={activePage === 'compras' ? 'page' : undefined} className={`nav-item ${activePage === 'compras' ? 'active' : ''}`} data-testid="nav-compras"><ShoppingBasket size={19} />Compras{remaining > 0 && <span className="ml-0.5 rounded-full bg-[#dcebd8] px-1.5 text-[.62rem]">{remaining}</span>}</button>
        </div>
      </nav>

      <main className="page-wrap pt-6 sm:pt-9">
        <Switch>
          <Route path="/">
            <section className="fade-in">
              <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="eyebrow mb-3">O seu caderno de cozinha</p><h1 className="page-title text-[#294532]">Receitas para<br className="hidden sm:block" /> dias bons.</h1><p className="mt-3 max-w-md text-[.95rem] leading-relaxed text-[#738071]">Guarde os pratos de que gosta e deixe o resto da semana ganhar forma.</p></div>
                <button className="btn-primary self-start sm:self-auto" onClick={openNew} data-testid="button-add-recipe"><Plus size={18} /> Nova receita</button>
              </div>
              <div className="soft-panel mb-6 flex items-center gap-4 rounded-[22px] p-4 sm:p-5">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-[#598257]"><CookingPot size={24} /></div>
                <div className="min-w-0 flex-1"><p className="font-semibold text-[#38563c]">A semana começa com uma boa ideia.</p><p className="mt-1 text-sm text-[#788674]">{recipes.length} receitas à mão · {Object.values(plan).filter((slot) => slot.recipeId).length} pratos planeados</p></div>
                <button onClick={() => nav('/planeador')} className="hidden items-center gap-1 rounded-xl border-0 bg-white/75 px-3 py-2 text-sm font-semibold text-[#416448] sm:flex" data-testid="button-open-planner">Planear <ArrowLeft className="rotate-180" size={15} /></button>
              </div>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#899687]" size={18} /><input aria-label="Pesquisar receitas" className="field pl-11" placeholder="Procurar uma receita..." value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-search-recipes" /></label>
                <div className="relative"><select className="field min-w-44 appearance-none pr-10" aria-label="Filtrar por categoria" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} data-testid="select-category-filter"><option>Todas</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#788674]" size={16} /></div>
              </div>
              <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-xl font-semibold text-[#36543c]">A sua coleção <span className="ml-1 font-sans text-sm font-normal text-[#859082]">({filteredRecipes.length})</span></h2><span className="text-xs text-[#879183]">Toque para ver a receita</span></div>
              {filteredRecipes.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => setDetail(recipe)} onEdit={() => { setEditing(recipe); setFormError(''); setFormOpen(true); }} data-testid={`card-recipe-${recipe.id}`} />)}
              </div> : <div className="card flex flex-col items-center px-6 py-12 text-center" data-testid="empty-recipes"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#eff4ea] text-[#668263]"><BookOpen size={25} /></span><h3 className="font-serif text-xl font-semibold text-[#36543c]">{recipes.length ? 'Não encontrámos essa receita' : 'O seu caderno está à espera'}</h3><p className="mt-2 max-w-sm text-sm text-[#7b8678]">{recipes.length ? 'Experimente outra pesquisa ou categoria.' : 'Comece por guardar um prato que goste de cozinhar.'}</p>{!recipes.length && <button className="btn-primary mt-5" onClick={openNew} data-testid="button-empty-add">Adicionar receita</button>}</div>}
            </section>
          </Route>
          <Route path="/planeador">
            <section className="fade-in">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow mb-3">Sete dias, ao seu ritmo</p><h1 className="page-title text-[#294532]">O planeador</h1><p className="mt-3 text-[#738071]">Escolha o que lhe apetece. Pode sempre mudar de ideias.</p></div><div className="rounded-2xl bg-[#eff4ea] px-4 py-3 text-sm text-[#557452]"><strong>{Object.values(plan).filter((slot) => slot.recipeId).length}</strong> refeições escolhidas</div></div>
              <div className="mb-4 flex items-center gap-2 text-sm text-[#7c8979]"><CalendarDays size={17} /><span>Almoço e jantar, de segunda a domingo</span></div>
              <div className="grid gap-3 md:grid-cols-2">
                {DAYS.map((day, index) => <section key={day} className="card overflow-hidden" data-testid={`plan-day-${index}`}>
                  <div className="flex items-center justify-between border-b border-[#edf0e9] bg-[#fbfcf8] px-4 py-3"><h2 className="font-serif text-lg font-semibold text-[#38543d]">{day}</h2>{index === 0 && <span className="rounded-full bg-[#e8f1e3] px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-wider text-[#557452]">Início da semana</span>}</div>
                  <div className="grid grid-cols-2 divide-x divide-[#edf0e9]">
                    {['Almoço', 'Jantar'].map((meal) => {
                      const key = `${index}-${meal}`;
                      const recipe = recipes.find((item) => item.id === plan[key]?.recipeId);
                      return <div key={meal} className="min-w-0 p-3.5"><span className="mb-2 block text-[.68rem] font-bold uppercase tracking-widest text-[#90998e]">{meal}</span>
                        {recipe ? <div className="group flex min-h-14 items-center gap-2"><button onClick={() => setDetail(recipe)} className="min-w-0 flex-1 text-left" data-testid={`planned-recipe-${key}`}><span className="block truncate text-sm font-semibold text-[#38543d]">{recipe.name}</span><span className="mt-1 flex items-center gap-1 text-xs text-[#889283]"><Clock3 size={12} />{recipe.prepTime} min</span></button><button className="icon-button !size-8 !border-0 !bg-[#f4f6f0] text-[#788674]" title="Substituir refeição" aria-label={`Substituir ${meal.toLowerCase()} de ${day}`} onClick={() => { setSlotPicker(key); setPickerSearch(''); }} data-testid={`button-replace-${key}`}><Pencil size={14} /></button><button className="icon-button !size-8 !border-0 !bg-transparent !text-[#9b776e]" title="Remover refeição" aria-label={`Remover ${meal.toLowerCase()} de ${day}`} onClick={() => setPlan((old) => ({ ...old, [key]: { recipeId: null } }))} data-testid={`button-remove-${key}`}><X size={16} /></button></div>
                        : <button onClick={() => { setSlotPicker(key); setPickerSearch(''); }} className="flex min-h-14 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d8e1d3] bg-[#fbfcf9] px-2 text-xs font-semibold text-[#6c8569] hover:bg-[#f1f5ed]" data-testid={`button-assign-${key}`}><Plus size={15} /> Escolher receita</button>}
                      </div>;
                    })}
                  </div>
                </section>)}
              </div>
            </section>
          </Route>
          <Route path="/compras">
            <section className="fade-in">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Tudo o que falta trazer</p><h1 className="page-title text-[#294532]">Lista de compras</h1><p className="mt-3 text-[#738071]">Feita a partir das receitas que escolheu para a semana.</p></div>{plannedShopping.length > 0 && <button onClick={() => setChecked({})} className="btn-quiet" data-testid="button-uncheck-all"><RotateCcw size={16} /> Desmarcar tudo</button>}</div>
              {plannedShopping.length ? <>
                <div className="soft-panel mb-5 flex items-center gap-4 rounded-[22px] p-4"><div className="grid size-11 place-items-center rounded-2xl bg-white/80 text-[#598257]"><ShoppingBasket size={22} /></div><div><p className="font-semibold text-[#38563c]">{remaining === 0 ? 'Tudo tratado. Boa ida às compras.' : `Faltam ${remaining} ${remaining === 1 ? 'ingrediente' : 'ingredientes'}.`}</p><p className="mt-0.5 text-sm text-[#788674]">{plannedShopping.length} ingredientes únicos para as refeições planeadas</p></div></div>
                <div className="card divide-y divide-[#edf0e9] overflow-hidden">
                  {plannedShopping.map((item, index) => <label key={item.key} className={`flex min-h-[60px] cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#fbfcf8] ${item.checked ? 'opacity-55' : ''}`} data-testid={`shopping-item-${index}`}><input type="checkbox" className="peer sr-only" checked={item.checked} onChange={(event) => setChecked((old) => ({ ...old, [item.key]: event.target.checked }))} data-testid={`checkbox-shopping-${index}`} /><span className={`grid size-6 shrink-0 place-items-center rounded-lg border transition-colors ${item.checked ? 'border-[#5b8058] bg-[#5b8058] text-white' : 'border-[#cbd6c7] bg-white text-transparent'}`}><Check size={15} /></span><span className={`flex-1 text-sm font-medium text-[#3f5141] ${item.checked ? 'line-through' : ''}`}>{item.name}</span>{item.count > 1 && <span className="rounded-full bg-[#eff4ea] px-2 py-1 text-xs font-semibold text-[#6c8266]">× {item.count}</span>}</label>)}
                </div>
                <p className="mt-4 flex items-center gap-2 px-1 text-xs text-[#899386]"><CheckCircle2 size={15} /> Os artigos assinalados ficam guardados enquanto continuarem na lista.</p>
              </> : <div className="card flex flex-col items-center px-6 py-14 text-center" data-testid="empty-shopping"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#eff4ea] text-[#668263]"><ShoppingBasket size={25} /></span><h2 className="font-serif text-xl font-semibold text-[#36543c]">A lista começa no planeador</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#7b8678]">Escolha algumas receitas para a semana e reunimos aqui todos os ingredientes de que precisa.</p><button className="btn-primary mt-5" onClick={() => nav('/planeador')} data-testid="button-empty-to-planner"><CalendarDays size={17} /> Abrir planeador</button></div>}
            </section>
          </Route>
          <Route><section className="card p-8 text-center"><h1 className="font-serif text-2xl">Página não encontrada</h1><button className="btn-primary mt-4" onClick={() => nav('/')}>Voltar às receitas</button></section></Route>
        </Switch>
      </main>
      <footer className="page-wrap py-8 text-center text-xs text-[#97a092]"><span>Feito com cuidado, para a sua cozinha.</span></footer>

      {formOpen && <RecipeForm recipe={editing} error={formError} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveRecipe} />}
      {detail && <RecipeDetail recipe={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); setFormError(''); setFormOpen(true); }} onDelete={() => deleteRecipe(detail)} />}
      {slotPicker && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSlotPicker(null); }}><div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="picker-title"><div className="flex items-center justify-between border-b border-[#edf0e9] p-5"><div><p className="eyebrow mb-1">Escolher do caderno</p><h2 id="picker-title" className="font-serif text-2xl font-semibold text-[#294532]">Que prato apetece?</h2></div><button className="icon-button" onClick={() => setSlotPicker(null)} aria-label="Fechar" data-testid="button-close-picker"><X size={19} /></button></div><div className="p-5"><label className="relative mb-4 block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#899687]" size={17} /><input className="field pl-10" placeholder="Pesquisar receitas..." value={pickerSearch} onChange={(event) => setPickerSearch(event.target.value)} data-testid="input-picker-search" /></label><div className="max-h-[50dvh] space-y-2 overflow-y-auto">{recipes.filter((item) => item.name.toLocaleLowerCase('pt-PT').includes(pickerSearch.toLocaleLowerCase('pt-PT'))).map((recipe) => <button key={recipe.id} onClick={() => assignRecipe(recipe.id)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e8ede5] p-2.5 text-left hover:bg-[#f6f8f3]" data-testid={`button-pick-${recipe.id}`}><RecipeThumb recipe={recipe} className="size-14 rounded-xl" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-[#3a513d]">{recipe.name}</span><span className="mt-1 block text-xs text-[#889283]">{recipe.category} · {recipe.prepTime} min</span></span><Plus className="mr-2 text-[#658261]" size={18} /></button>)}</div>{recipes.length === 0 && <p className="py-8 text-center text-sm text-[#788674]">Adicione primeiro uma receita ao seu caderno.</p>}</div></div></div>}
    </div>
  );
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
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-sheet large" role="dialog" aria-modal="true" aria-labelledby="recipe-form-title"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0e9] bg-[#fbfcf8]/95 p-5 backdrop-blur"><div><p className="eyebrow mb-1">{recipe ? 'Atualizar caderno' : 'Uma nova favorita'}</p><h2 id="recipe-form-title" className="font-serif text-2xl font-semibold text-[#294532]">{recipe ? 'Editar receita' : 'Nova receita'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar formulário" data-testid="button-close-form"><X size={19} /></button></div><form onSubmit={onSubmit} className="space-y-4 p-5"><div><label className="field-label" htmlFor="recipe-name">Nome da receita</label><input className="field" id="recipe-name" name="name" defaultValue={recipe?.name} placeholder="Ex.: Massa de domingo" required data-testid="input-recipe-name" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]"><div><label className="field-label" htmlFor="recipe-category">Categoria</label><select className="field" id="recipe-category" name="category" defaultValue={recipe?.category ?? 'Almoço'} data-testid="select-recipe-category">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div><div><label className="field-label" htmlFor="recipe-time">Tempo (min)</label><input className="field" id="recipe-time" name="prepTime" type="number" min="1" defaultValue={recipe?.prepTime ?? 25} data-testid="input-recipe-time" /></div></div><div><label className="field-label" htmlFor="recipe-photo">URL da fotografia <span className="font-normal text-[#91998e]">(opcional)</span></label><input className="field" id="recipe-photo" name="photoUrl" type="url" defaultValue={recipe?.photoUrl} placeholder="https://..." data-testid="input-recipe-photo" /></div><div><label className="field-label" htmlFor="recipe-ingredients">Ingredientes <span className="font-normal text-[#91998e]">— um por linha</span></label><textarea className="field min-h-28 resize-y" id="recipe-ingredients" name="ingredients" defaultValue={recipe?.ingredients.join('\n')} placeholder={'2 tomates maduros\n1 cebola\nAzeite'} required data-testid="textarea-recipe-ingredients" /></div><div><label className="field-label" htmlFor="recipe-steps">Preparação <span className="font-normal text-[#91998e]">— um passo por linha</span></label><textarea className="field min-h-32 resize-y" id="recipe-steps" name="steps" defaultValue={recipe?.steps.join('\n')} placeholder={'Picar os legumes.\nAquecer a panela e cozinhar...'} required data-testid="textarea-recipe-steps" /></div>{error && <p className="rounded-xl bg-[#fbefec] p-3 text-sm text-[#9b5147]" role="alert" data-testid="status-form-error">{error}</p>}<div className="flex flex-col-reverse gap-2 border-t border-[#edf0e9] pt-4 sm:flex-row sm:justify-end"><button type="button" className="btn-quiet" onClick={onClose} data-testid="button-cancel-recipe">Cancelar</button><button type="submit" className="btn-primary" data-testid="button-save-recipe"><Check size={17} /> {recipe ? 'Guardar alterações' : 'Guardar receita'}</button></div></form></div></div>;
}
function RecipeDetail({ recipe, onClose, onEdit, onDelete }: { recipe: Recipe; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><article className="modal-sheet large" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title"><div className="relative h-52 sm:h-64"><RecipeThumb recipe={recipe} className="h-full w-full" /><button onClick={onClose} className="icon-button absolute right-4 top-4 border-white/80 bg-white/90" aria-label="Fechar receita" data-testid="button-close-detail"><X size={19} /></button><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#52704e]">{recipe.category}</span></div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="recipe-detail-title" className="font-serif text-3xl font-semibold leading-tight text-[#294532]" data-testid={`text-recipe-title-${recipe.id}`}>{recipe.name}</h2><span className="mt-2 flex items-center gap-1.5 text-sm text-[#879183]"><Clock3 size={15} /> {recipe.prepTime} minutos</span></div><div className="flex gap-2"><button className="btn-quiet !min-h-10 !px-3" onClick={onEdit} data-testid="button-detail-edit"><Pencil size={15} /> Editar</button><button className="icon-button !size-10 text-[#a06459]" onClick={onDelete} aria-label="Eliminar receita" data-testid="button-delete-recipe"><Trash2 size={17} /></button></div></div><div className="mt-7 grid gap-7 sm:grid-cols-[.8fr_1.2fr]"><section><h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-[#3b593f]"><ShoppingBasket size={18} /> Ingredientes</h3><ul className="space-y-2.5">{recipe.ingredients.map((ingredient, index) => <li key={`${ingredient}-${index}`} className="flex gap-2 text-sm leading-relaxed text-[#5d6c5e]" data-testid={`text-ingredient-${index}`}><span className="mt-[.55rem] size-1.5 shrink-0 rounded-full bg-[#8ba080]" />{ingredient}</li>)}</ul></section><section><h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-[#3b593f]"><CookingPot size={18} /> Preparação</h3><ol className="space-y-3">{recipe.steps.map((step, index) => <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-relaxed text-[#5d6c5e]" data-testid={`text-step-${index}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#edf3e8] text-xs font-bold text-[#60805b]">{index + 1}</span>{step}</li>)}</ol></section></div></div></article></div>;
}
function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const base = import.meta.env.BASE_URL || '/';
      window.addEventListener('load', () => { navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => undefined); }, { once: true });
    }
  }, []);
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppShell /></WouterRouter>;
}
export default App;
