export type Category = 'Pequeno-almoço' | 'Almoço' | 'Jantar' | 'Snacking';

export type Recipe = {
  id: string;
  name: string;
  category: Category;
  photoUrl: string;
  prepTime: number;
  ingredients: string[];
  steps: string[];
  cuisine?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  allergens?: string[];
};

export type UserProfile = {
  restrictions: string[];
  cuisines: string[];
  preferredIngredients: string[];
  maxCookTime: 'under30' | '30to60' | 'over60';
  cookingStyle: 'fresh' | 'batch' | 'mixed';
  pantry: string[];
  supermarket: string;
};

export type WeekPlan = {
  weekStart: string;
  slots: Record<string, string | null>;
  status: 'proposed' | 'approved';
  generatedAt: string;
};

export type PlannerData = {
  recipes: Recipe[];
  profile: UserProfile | null;
  weeks: WeekPlan[];
};

export type GroceryItem = {
  key: string;
  name: string;
  quantity: string;
  checked: boolean;
  count: number;
  estimatedPrice: number;
};

export const RESTRICTIONS = [
  'Glúten',
  'Lactose',
  'Frutos secos',
  'Amendoim',
  'Marisco',
  'Peixe',
  'Ovos',
  'Soja',
  'Vegetariano',
  'Vegan',
] as const;

export const CUISINES = [
  'Tradicional Portuguesa',
  'Italiana',
  'Asiática',
  'Mediterrânica',
  'Mexicana',
  'Rápida e fácil',
] as const;

export const TIME_OPTIONS = [
  { value: 'under30', label: 'Pouco tempo', description: 'Até 30 minutos' },
  { value: '30to60', label: 'Tempo moderado', description: '30 a 60 minutos' },
  { value: 'over60', label: 'Gosto de cozinhar', description: 'Mais de 60 minutos' },
] as const;

export const COOKING_STYLES = [
  { value: 'fresh', label: 'Cozinhar fresco', description: 'Preparar cada refeição na hora' },
  { value: 'batch', label: 'Cozinhar a dobrar', description: 'Guardar porções para o dia seguinte' },
  { value: 'mixed', label: 'Um pouco dos dois', description: 'Alternar entre fresco e refeições preparadas' },
] as const;

export const SUPERMARKETS = [
  'Continente',
  'Pingo Doce',
  'Lidl',
  'Mercadona',
  'Auchan',
] as const;

export const PANTRY_OPTIONS = [
  'Azeite',
  'Arroz',
  'Massa',
  'Sal',
  'Pimenta',
  'Cebola',
  'Alho',
  'Ovos',
  'Tomate',
  'Batata',
  'Farinha',
  'Grão-de-bico',
  'Feijão',
  'Leite',
  'Açúcar',
] as const;

const STORE = {
  recipes: 'prato-a-prato:recipes',
  legacyPlan: 'prato-a-prato:plan',
  profile: 'prato-a-prato:profile:v1',
  weeks: 'prato-a-prato:weeks:v1',
  checked: 'prato-a-prato:checked',
  seedVersion: 'prato-a-prato:seed-version',
};

const photos = [
  'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900',
];

function recipe(
  id: string,
  name: string,
  category: Category,
  prepTime: number,
  cuisine: string,
  ingredients: string[],
  steps: string[],
  diet: { vegetarian?: boolean; vegan?: boolean; allergens?: string[] } = {},
): Recipe {
  const photoIndex = Number(id.slice(1)) % photos.length;
  return { id, name, category, prepTime, cuisine, ingredients, steps, photoUrl: photos[photoIndex], ...diet };
}

export const INITIAL_RECIPES: Recipe[] = [
  recipe('r1', 'Tosta de abacate e ovo', 'Pequeno-almoço', 15, 'Rápida e fácil', ['2 fatias de pão de fermentação lenta', '1 abacate maduro', '2 ovos', '1 limão', 'Pimenta preta', 'Sal'], ['Tostar o pão até ficar dourado.', 'Esmagar o abacate com umas gotas de limão, sal e pimenta.', 'Estrelar os ovos e servir sobre o pão com o abacate.'], { vegetarian: true, allergens: ['Glúten', 'Ovos'] }),
  recipe('r2', 'Salada morna de grão e abóbora', 'Almoço', 35, 'Mediterrânica', ['400 g de grão-de-bico cozido', '300 g de abóbora', '100 g de espinafres', '1 cebola roxa', '2 colheres de azeite', '1 colher de tahini', '1 limão'], ['Cortar a abóbora em cubos e assar com azeite durante 25 minutos.', 'Aquecer o grão numa frigideira com a cebola laminada.', 'Juntar os espinafres e envolver até murcharem.', 'Servir com a abóbora e molho de tahini e limão.'], { vegetarian: true, vegan: true, allergens: ['Sésamo'] }),
  recipe('r3', 'Arroz de tomate com ovo', 'Jantar', 30, 'Tradicional Portuguesa', ['250 g de arroz carolino', '3 tomates maduros', '1 cebola', '2 dentes de alho', '4 ovos', '750 ml de caldo de legumes', 'Coentros frescos'], ['Refogar a cebola e o alho picados num fio de azeite.', 'Juntar o tomate em cubos e deixar apurar.', 'Adicionar o arroz e o caldo quente. Cozinhar até ficar cremoso.', 'Escalfar os ovos no arroz e terminar com coentros.'], { vegetarian: true, allergens: ['Ovos'] }),
  recipe('r4', 'Iogurte com pêra e nozes', 'Pequeno-almoço', 8, 'Rápida e fácil', ['2 iogurtes naturais', '1 pêra', '30 g de nozes', '2 colheres de mel', 'Canela'], ['Cortar a pêra em fatias finas.', 'Distribuir o iogurte por duas taças.', 'Juntar a pêra, as nozes, o mel e uma pitada de canela.'], { vegetarian: true, allergens: ['Lactose', 'Frutos secos'] }),
  recipe('r5', 'Sopa de legumes da horta', 'Jantar', 40, 'Tradicional Portuguesa', ['2 cenouras', '1 curgete', '1 alho-francês', '2 batatas', '1,2 l de água', 'Azeite', 'Sal'], ['Lavar e cortar os legumes em pedaços.', 'Cozer tudo em água com sal durante 30 minutos.', 'Triturar até obter uma sopa cremosa e finalizar com azeite.'], { vegetarian: true, vegan: true }),
  recipe('r6', 'Bolachas de aveia e banana', 'Snacking', 25, 'Rápida e fácil', ['2 bananas maduras', '120 g de flocos de aveia', '1 colher de manteiga de amendoim', 'Canela'], ['Esmagar as bananas e misturar com a aveia e a manteiga de amendoim.', 'Moldar pequenas bolachas num tabuleiro.', 'Levar ao forno a 180 °C durante 15 minutos.'], { vegetarian: true, vegan: true, allergens: ['Amendoim', 'Glúten'] }),
  recipe('r7', 'Papas de trigo-sarraceno e maçã', 'Pequeno-almoço', 12, 'Rápida e fácil', ['60 g de flocos de trigo-sarraceno', '200 ml de bebida de coco', '1 maçã', 'Canela', '1 colher de sementes de chia'], ['Cozer os flocos na bebida vegetal durante 8 minutos.', 'Juntar a maçã em cubos, a chia e a canela.', 'Servir ainda quente.'], { vegetarian: true, vegan: true }),
  recipe('r8', 'Taça de chia e manga', 'Pequeno-almoço', 10, 'Mediterrânica', ['3 colheres de sementes de chia', '200 ml de bebida de coco', '1 manga', '1 colher de xarope de ácer'], ['Misturar a chia com a bebida de coco e deixar repousar 10 minutos.', 'Descascar e cortar a manga.', 'Servir a taça com manga e xarope de ácer.'], { vegetarian: true, vegan: true }),
  recipe('r9', 'Tacos de feijão preto', 'Jantar', 20, 'Mexicana', ['1 lata de feijão preto', '4 tortilhas de milho', '1 abacate', '1 tomate', '1 lima', 'Coentros frescos'], ['Aquecer o feijão com uma pitada de cominhos.', 'Cortar o tomate e o abacate em cubos.', 'Rechear as tortilhas e terminar com lima e coentros.'], { vegetarian: true, vegan: true }),
  recipe('r10', 'Bowl de quinoa e legumes', 'Almoço', 25, 'Mediterrânica', ['150 g de quinoa', '1 curgete', '1 pimento', '100 g de grão-de-bico cozido', '1 limão', 'Azeite'], ['Cozer a quinoa conforme as instruções da embalagem.', 'Saltear a curgete e o pimento em azeite.', 'Juntar o grão e servir sobre a quinoa com sumo de limão.'], { vegetarian: true, vegan: true }),
  recipe('r11', 'Caril de lentilhas e coco', 'Jantar', 35, 'Asiática', ['200 g de lentilhas vermelhas', '400 ml de leite de coco', '1 cebola', '2 tomates', '1 colher de caril', '150 g de arroz basmati'], ['Refogar a cebola e o caril.', 'Juntar as lentilhas, o tomate e o leite de coco.', 'Cozer em lume brando até as lentilhas ficarem macias e servir com arroz.'], { vegetarian: true, vegan: true }),
  recipe('r12', 'Tofu salteado com legumes', 'Almoço', 25, 'Asiática', ['200 g de tofu', '1 cenoura', '1 curgete', '2 colheres de molho de soja', '150 g de arroz', '1 colher de óleo de sésamo'], ['Cozer o arroz.', 'Cortar o tofu e os legumes em tiras e saltear.', 'Adicionar o molho de soja e o óleo de sésamo. Servir com arroz.'], { vegetarian: true, vegan: true, allergens: ['Soja', 'Glúten', 'Sésamo'] }),
  recipe('r13', 'Massa com tomate e manjericão', 'Almoço', 20, 'Italiana', ['200 g de esparguete', '250 g de tomate cherry', '2 dentes de alho', 'Manjericão fresco', 'Azeite'], ['Cozer a massa em água com sal.', 'Saltear o alho e o tomate em azeite.', 'Envolver a massa no molho e juntar manjericão.'], { vegetarian: true, vegan: true, allergens: ['Glúten'] }),
  recipe('r14', 'Bruschetta de tomate', 'Snacking', 15, 'Italiana', ['4 fatias de pão', '2 tomates maduros', '1 dente de alho', 'Manjericão fresco', 'Azeite'], ['Tostar as fatias de pão.', 'Esfregar o alho no pão e cobrir com tomate picado.', 'Temperar com azeite e manjericão.'], { vegetarian: true, vegan: true, allergens: ['Glúten'] }),
  recipe('r15', 'Salada de feijão branco e tomate', 'Almoço', 15, 'Mediterrânica', ['1 lata de feijão branco', '2 tomates', '1 cebola roxa', '1 limão', 'Salsa fresca', 'Azeite'], ['Escorrer e passar o feijão por água.', 'Cortar o tomate e a cebola.', 'Misturar tudo com limão, salsa e azeite.'], { vegetarian: true, vegan: true }),
  recipe('r16', 'Sopa rápida de espinafres e feijão', 'Jantar', 25, 'Tradicional Portuguesa', ['200 g de espinafres', '1 lata de feijão branco', '1 batata', '1 cebola', '700 ml de caldo de legumes', 'Azeite'], ['Refogar a cebola e a batata em azeite.', 'Juntar o caldo e cozinhar 15 minutos.', 'Adicionar o feijão e os espinafres e cozinhar mais 5 minutos.'], { vegetarian: true, vegan: true }),
  recipe('r17', 'Batata-doce recheada com grão', 'Almoço', 28, 'Mediterrânica', ['2 batatas-doces', '200 g de grão-de-bico', '1 limão', '2 colheres de tahini', 'Salsa fresca'], ['Assar as batatas-doces até ficarem macias.', 'Aquecer o grão e temperar com limão.', 'Abrir as batatas e servir recheadas com grão, tahini e salsa.'], { vegetarian: true, vegan: true, allergens: ['Sésamo'] }),
  recipe('r18', 'Gaspacho alentejano', 'Almoço', 15, 'Tradicional Portuguesa', ['3 tomates maduros', '1 pepino', '1 pimento verde', '1 dente de alho', '1 colher de vinagre', 'Azeite'], ['Cortar os legumes em cubos pequenos.', 'Temperar com vinagre, azeite e sal.', 'Servir fresco com água fria a gosto.'], { vegetarian: true, vegan: true }),
  recipe('r19', 'Batido de banana e frutos vermelhos', 'Snacking', 5, 'Rápida e fácil', ['1 banana', '150 g de frutos vermelhos', '200 ml de bebida de soja', '1 colher de sementes de linhaça'], ['Colocar todos os ingredientes no liquidificador.', 'Triturar até ficar cremoso e servir de imediato.'], { vegetarian: true, vegan: true, allergens: ['Soja'] }),
  recipe('r20', 'Húmus com legumes crocantes', 'Snacking', 12, 'Mediterrânica', ['200 g de grão-de-bico', '1 colher de tahini', '1 limão', '1 cenoura', '1 pepino', 'Azeite'], ['Triturar o grão com tahini, limão e azeite.', 'Cortar a cenoura e o pepino em palitos.', 'Servir os legumes com o húmus.'], { vegetarian: true, vegan: true, allergens: ['Sésamo'] }),
  recipe('r21', 'Salada de atum e feijão-frade', 'Almoço', 12, 'Tradicional Portuguesa', ['1 lata de atum', '1 lata de feijão-frade', '1 cebola', '2 ovos', 'Salsa fresca', 'Azeite'], ['Cozer os ovos e deixar arrefecer.', 'Escorrer o atum e o feijão.', 'Misturar com cebola picada, salsa, azeite e os ovos cortados.'], { allergens: ['Peixe', 'Ovos'] }),
  recipe('r22', 'Salmão no forno com batata', 'Jantar', 45, 'Mediterrânica', ['2 lombos de salmão', '400 g de batata', '1 limão', 'Azeite', 'Endro'], ['Cortar a batata e levar ao forno com azeite durante 20 minutos.', 'Juntar o salmão temperado com limão e endro.', 'Assar mais 15 minutos e servir.'], { allergens: ['Peixe'] }),
  recipe('r23', 'Frango de limão e arroz', 'Jantar', 35, 'Tradicional Portuguesa', ['300 g de peito de frango', '150 g de arroz', '1 limão', '1 dente de alho', 'Azeite'], ['Temperar o frango com limão e alho.', 'Grelhar até estar bem cozinhado.', 'Cozer o arroz e servir com o frango.']),
  recipe('r24', 'Almôndegas de peru com tomate', 'Jantar', 40, 'Italiana', ['300 g de peru picado', '1 ovo', '2 colheres de pão ralado', '300 g de tomate triturado', '150 g de massa'], ['Misturar o peru com ovo e pão ralado e formar almôndegas.', 'Cozer as almôndegas no molho de tomate.', 'Servir com massa cozida.'], { allergens: ['Ovos', 'Glúten'] }),
  recipe('r25', 'Caril de camarão e arroz', 'Jantar', 30, 'Asiática', ['250 g de camarão', '200 ml de leite de coco', '1 cebola', '1 colher de caril', '150 g de arroz'], ['Cozer o arroz.', 'Refogar a cebola e o caril e juntar o leite de coco.', 'Adicionar o camarão e cozinhar até ficar rosado. Servir com arroz.'], { allergens: ['Marisco'] }),
  recipe('r26', 'Risoto de cogumelos', 'Jantar', 40, 'Italiana', ['200 g de arroz arbóreo', '200 g de cogumelos', '700 ml de caldo de legumes', '1 cebola', '30 g de queijo parmesão', 'Azeite'], ['Refogar a cebola e os cogumelos.', 'Juntar o arroz e adicionar caldo aos poucos, mexendo.', 'Finalizar com parmesão ralado.'], { vegetarian: true, allergens: ['Lactose'] }),
  recipe('r27', 'Bacalhau à Brás', 'Jantar', 40, 'Tradicional Portuguesa', ['250 g de bacalhau demolhado', '300 g de batata palha', '1 cebola', '4 ovos', 'Azeitonas', 'Salsa'], ['Refogar a cebola e juntar o bacalhau desfiado.', 'Adicionar a batata palha e envolver.', 'Juntar os ovos batidos e mexer até ficarem cremosos. Finalizar com azeitonas e salsa.'], { allergens: ['Peixe', 'Ovos'] }),
  recipe('r28', 'Bowl de arroz, edamame e pepino', 'Almoço', 20, 'Asiática', ['150 g de arroz', '100 g de edamame', '1 pepino', '1 cenoura', '1 colher de molho de soja', 'Sementes de sésamo'], ['Cozer o arroz e o edamame.', 'Cortar o pepino e a cenoura em tiras.', 'Servir tudo numa taça com molho de soja e sésamo.'], { vegetarian: true, vegan: true, allergens: ['Soja', 'Glúten', 'Sésamo'] }),
  recipe('r29', 'Pescada com legumes no forno', 'Jantar', 35, 'Mediterrânica', ['2 filetes de pescada', '1 curgete', '2 cenouras', '1 limão', 'Azeite'], ['Cortar os legumes e colocar num tabuleiro.', 'Temperar os filetes com limão e azeite.', 'Assar tudo a 190 °C até o peixe ficar cozinhado.'], { allergens: ['Peixe'] }),
  recipe('r30', 'Papas de arroz com canela', 'Pequeno-almoço', 25, 'Tradicional Portuguesa', ['100 g de arroz', '500 ml de bebida de arroz', '1 casca de limão', 'Canela', '2 colheres de açúcar'], ['Cozer o arroz com a bebida de arroz e a casca de limão.', 'Mexer até ficar cremoso.', 'Servir com canela e açúcar.'], { vegetarian: true, vegan: true }),
  recipe('r31', 'Estufado de grão e legumes', 'Jantar', 80, 'Tradicional Portuguesa', ['400 g de grão-de-bico', '2 cenouras', '1 cebola', '2 tomates', '1 folha de louro', 'Azeite'], ['Refogar a cebola e a cenoura em azeite.', 'Juntar o tomate, o grão e o louro com água suficiente.', 'Cozinhar em lume brando até apurar.'], { vegetarian: true, vegan: true }),
  recipe('r32', 'Bacalhau à lagareiro', 'Jantar', 85, 'Tradicional Portuguesa', ['2 postas de bacalhau', '500 g de batatas pequenas', '4 dentes de alho', 'Azeite', 'Salsa'], ['Assar as batatas até ficarem macias.', 'Juntar o bacalhau e os alhos esmagados.', 'Regar generosamente com azeite e assar até dourar.'], { allergens: ['Peixe'] }),
  recipe('r33', 'Lasanha bolonhesa', 'Jantar', 90, 'Italiana', ['300 g de carne de vaca picada', '250 g de placas de lasanha', '400 g de tomate triturado', '200 ml de leite', '100 g de queijo ralado'], ['Preparar um molho de carne com tomate.', 'Fazer camadas alternadas de massa e molho.', 'Cobrir com molho branco e queijo e levar ao forno até dourar.'], { allergens: ['Glúten', 'Lactose'] }),
  recipe('r34', 'Ragu de lentilhas e cogumelos', 'Jantar', 75, 'Italiana', ['250 g de lentilhas', '200 g de cogumelos', '1 cebola', '2 cenouras', '400 g de tomate triturado', 'Azeite'], ['Refogar a cebola, a cenoura e os cogumelos.', 'Juntar as lentilhas e o tomate com água.', 'Cozinhar em lume brando até as lentilhas ficarem macias.'], { vegetarian: true, vegan: true }),
  recipe('r35', 'Feijoada à Portuguesa', 'Jantar', 120, 'Tradicional Portuguesa', ['500 g de feijão encarnado cozido', '250 g de carne de porco', '1 chouriço', '1 cebola', '2 cenouras', 'Louro'], ['Refogar a cebola e alourar a carne.', 'Juntar o feijão, o chouriço, a cenoura e o louro.', 'Cozinhar lentamente até o molho ficar apurado.']),
  recipe('r36', 'Arroz de forno com legumes', 'Almoço', 75, 'Mediterrânica', ['250 g de arroz', '1 curgete', '1 pimento', '1 cebola', '700 ml de caldo de legumes', 'Azeite'], ['Saltear os legumes e envolver o arroz.', 'Transferir para um tabuleiro e juntar o caldo.', 'Levar ao forno até o arroz absorver o líquido.'], { vegetarian: true, vegan: true }),
  recipe('r37', 'Frango assado com limão e alecrim', 'Jantar', 80, 'Tradicional Portuguesa', ['1 frango inteiro', '2 limões', 'Alecrim', '500 g de batata', 'Azeite', 'Sal'], ['Temperar o frango com limão, alecrim e sal.', 'Juntar as batatas e um fio de azeite.', 'Assar a 190 °C até o frango ficar bem cozinhado.']),
  recipe('r38', 'Pão de fermentação lenta', 'Pequeno-almoço', 210, 'Tradicional Portuguesa', ['500 g de farinha de trigo', '350 ml de água', '7 g de fermento', '10 g de sal'], ['Misturar a farinha, a água, o fermento e o sal.', 'Deixar levedar lentamente até duplicar de volume.', 'Formar o pão e cozer em forno quente até criar crosta.'], { vegetarian: true, vegan: true, allergens: ['Glúten'] }),
  recipe('r39', 'Empadão de lentilhas', 'Jantar', 75, 'Tradicional Portuguesa', ['250 g de lentilhas', '600 g de batata', '1 cebola', '2 cenouras', '200 ml de bebida de soja', 'Azeite'], ['Cozer as batatas e preparar um puré com a bebida vegetal.', 'Estufar as lentilhas com cebola e cenoura.', 'Cobrir com o puré e levar ao forno até dourar.'], { vegetarian: true, vegan: true, allergens: ['Soja'] }),
  recipe('r40', 'Lasanha de espinafres e ricotta', 'Jantar', 75, 'Italiana', ['250 g de placas de lasanha', '250 g de espinafres', '250 g de ricotta', '400 g de tomate triturado', 'Azeite'], ['Saltear os espinafres e misturar com a ricotta.', 'Fazer camadas de massa, espinafres e tomate.', 'Levar ao forno até a massa ficar macia.'], { vegetarian: true, allergens: ['Glúten', 'Lactose'] }),
  recipe('r41', 'Ratatouille de forno', 'Almoço', 70, 'Mediterrânica', ['1 curgete', '1 beringela', '2 tomates', '1 pimento', '1 cebola', 'Azeite', 'Tomilho'], ['Cortar os legumes em rodelas finas.', 'Dispor num tabuleiro e temperar com azeite e tomilho.', 'Assar lentamente até os legumes ficarem macios.'], { vegetarian: true, vegan: true }),
  recipe('r42', 'Cozido à Portuguesa', 'Jantar', 150, 'Tradicional Portuguesa', ['300 g de carne de vaca', '300 g de carne de porco', '1 chouriço', '1 couve', '3 batatas', '3 cenouras'], ['Cozer as carnes em água temperada.', 'Juntar os legumes e o chouriço quando a carne estiver tenra.', 'Servir as carnes e os legumes com um pouco do caldo.']),
  recipe('r43', 'Borrego estufado com ervas', 'Jantar', 130, 'Mediterrânica', ['600 g de borrego', '2 cebolas', '2 tomates', '2 dentes de alho', 'Alecrim', 'Azeite'], ['Alourar o borrego com cebola e alho.', 'Juntar o tomate, as ervas e um pouco de água.', 'Estufar lentamente até a carne ficar tenra.']),
  recipe('r44', 'Tarte de legumes e queijo', 'Almoço', 75, 'Mediterrânica', ['1 base de massa quebrada', '2 ovos', '150 ml de natas', '1 curgete', '100 g de queijo', '1 cebola'], ['Saltear a cebola e a curgete.', 'Bater os ovos com as natas e o queijo.', 'Rechear a massa e assar até ficar dourada.'], { vegetarian: true, allergens: ['Glúten', 'Lactose', 'Ovos'] }),
  recipe('r45', 'Chili de feijão de cozedura lenta', 'Jantar', 70, 'Mexicana', ['400 g de feijão encarnado', '2 tomates', '1 pimento', '1 cebola', '1 colher de cominhos', 'Azeite'], ['Refogar a cebola e o pimento.', 'Juntar o feijão, o tomate e os cominhos.', 'Cozinhar em lume brando até o chili ficar espesso.'], { vegetarian: true, vegan: true }),
  recipe('r46', 'Bolo de cenoura e noz', 'Snacking', 75, 'Tradicional Portuguesa', ['250 g de farinha', '2 cenouras', '3 ovos', '100 g de nozes', '150 g de açúcar', '100 ml de óleo'], ['Ralar as cenouras e picar as nozes.', 'Misturar os ingredientes até obter uma massa uniforme.', 'Levar ao forno até o bolo ficar cozido.'], { vegetarian: true, allergens: ['Glúten', 'Ovos', 'Frutos secos'] }),
];

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browsers can disable local storage or run out of space; keep the app usable for this session.
  }
}

function legacyPlanToWeek(raw: unknown, weekStart: string): WeekPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const slots = makeEmptySlots();
  let found = false;
  for (const [legacyKey, value] of Object.entries(raw)) {
    const match = legacyKey.match(/^([0-6])-(Almoço|Jantar)$/);
    if (!match || !value || typeof value !== 'object') continue;
    const recipeId = (value as { recipeId?: unknown }).recipeId;
    if (typeof recipeId !== 'string') continue;
    slots[`${match[1]}-${match[2]}`] = recipeId;
    found = true;
  }
  return found ? { weekStart, slots, status: 'proposed', generatedAt: 'legacy-migration' } : null;
}

export function loadPlannerData(): PlannerData {
  const storedRecipes = safeRead<unknown>(STORE.recipes, null);
  let recipes = Array.isArray(storedRecipes)
    ? (storedRecipes as Recipe[])
    : INITIAL_RECIPES;

  const seedVersion = safeRead<number>(STORE.seedVersion, 0);
  if (seedVersion < 3) {
    const existingIds = new Set(recipes.map((item) => item.id));
    recipes = [
      ...recipes,
      ...INITIAL_RECIPES.filter((item) => !existingIds.has(item.id)),
    ];
    safeWrite(STORE.seedVersion, 3);
  }

  const profile = safeRead<UserProfile | null>(STORE.profile, null);
  const storedWeeks = safeRead<unknown>(STORE.weeks, []);
  let weeks = Array.isArray(storedWeeks) ? (storedWeeks as WeekPlan[]) : [];
  if (!weeks.length) {
    const migrated = legacyPlanToWeek(
      safeRead(STORE.legacyPlan, null),
      currentWeekStart(),
    );
    if (migrated) weeks = [migrated];
  }

  return { recipes, profile, weeks };
}

export function savePlannerData(data: PlannerData): void {
  safeWrite(STORE.recipes, data.recipes);
  safeWrite(STORE.profile, data.profile);
  safeWrite(STORE.weeks, data.weeks.slice(-52));
  safeWrite(STORE.seedVersion, 3);
}

export function loadShoppingChecks(): Record<string, boolean> {
  const raw = safeRead<Record<string, boolean>>(STORE.checked, {});
  const migrated: Record<string, boolean> = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (value) migrated[normalizeIngredientName(key)] = true;
  });
  return migrated;
}

export function saveShoppingChecks(checks: Record<string, boolean>): void {
  safeWrite(STORE.checked, checks);
}

export function makeEmptySlots(): Record<string, string | null> {
  const slots: Record<string, string | null> = {};
  for (let day = 0; day < 7; day += 1) {
    slots[`${day}-Almoço`] = null;
    slots[`${day}-Jantar`] = null;
  }
  return slots;
}

export function currentWeekStart(date = new Date()): string {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const mondayOffset = (localDate.getDay() + 6) % 7;
  localDate.setDate(localDate.getDate() - mondayOffset);
  return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-PT')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ingredientDetails(line: string): { name: string; key: string; amount: number | null; unit: string | null } {
  const amountPattern = '(\\d+(?:[.,]\\d+)?|\\d+\\s*\\/\\s*\\d+|½|¼|¾|um|uma)';
  const unitPattern = '(kg|g|ml|l|litros?|unidades?|unid\\.?|dentes?|fatias?|colheres?(?:\\s+de\\s+(?:sopa|cha))?|chavenas?|chavena|ramos?|latas?)(?=\\s|$)';
  const match = line.trim().match(new RegExp(`^${amountPattern}\\s*(?:${unitPattern})?\\s*(.*)$`, 'i'));
  let amount: number | null = null;
  let unit: string | null = null;
  let rawName = line.trim();

  if (match) {
    const rawAmount = match[1].toLocaleLowerCase('pt-PT');
    if (rawAmount.includes('/')) {
      const [numerator, denominator] = rawAmount.split('/').map(Number);
      amount = denominator ? numerator / denominator : null;
    } else if (rawAmount === '½') amount = 0.5;
    else if (rawAmount === '¼') amount = 0.25;
    else if (rawAmount === '¾') amount = 0.75;
    else if (rawAmount === 'um' || rawAmount === 'uma') amount = 1;
    else amount = Number(rawAmount.replace(',', '.'));

    const rawUnit = (match[2] ?? '').toLocaleLowerCase('pt-PT');
    unit = normalizeUnit(rawUnit || 'un');
    rawName = match[3].trim();
    rawName = rawName.replace(/^(?:de|do|da|dos|das)\s+/i, '');
    rawName = rawName.replace(/^(?:sopa|chá)\s+(?:de\s+)?/i, '');
  }

  const name = rawName.replace(/^(?:de|do|da|dos|das)\s+/i, '').trim() || line.trim();
  return { name, key: normalizeIngredientName(name), amount, unit };
}

function normalizeUnit(rawUnit: string): string {
  const unit = normalizeText(rawUnit);
  if (unit === 'kg') return 'kg';
  if (unit === 'g') return 'g';
  if (unit === 'ml') return 'ml';
  if (unit === 'l' || unit.startsWith('litro')) return 'l';
  if (unit.startsWith('dente')) return 'dente';
  if (unit.startsWith('fatia')) return 'fatia';
  if (unit.startsWith('colher')) return 'colher';
  if (unit.startsWith('chavena')) return 'chavena';
  if (unit.startsWith('ramo')) return 'ramo';
  if (unit.startsWith('lata')) return 'lata';
  return 'un';
}

export function normalizeIngredientName(value: string): string {
  const amountPattern = /^\s*(?:\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+|½|¼|¾|um|uma)\s*(?:(?:kg|g|ml|l|litros?|unidades?|dentes?(?:\s+de\s+alho)?|fatias?|colheres?(?:\s+de\s+(?:sopa|chá|cha))?|chávenas?|chavenas?|chávena|chavena|ramos?|latas?)\b\s*)?/i;
  let source = value.trim().replace(amountPattern, '');
  source = source.replace(/^(?:de|do|da|dos|das)\s+/i, '');
  source = source.replace(/^(?:sopa|chá|cha)\s+(?:de\s+)?/i, '');
  let normalized = normalizeText(source);
  normalized = normalized
    .replace(/\b(maduros?|frescos?|frescas?|picados?|picadas?|cozidos?|cozidas?|ralados?|raladas?|em cubos|em fatias|naturais?)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const irregular: Record<string, string> = {
    nozes: 'noz',
    ovos: 'ovo',
    tomates: 'tomate',
    batatas: 'batata',
    cenouras: 'cenoura',
    espinafres: 'espinafre',
    cogumelos: 'cogumelo',
    lentilhas: 'lentilha',
    amêndoas: 'amendoa',
    amendoas: 'amendoa',
    morangos: 'morango',
    frutos: 'fruto',
  };
  if (irregular[normalized]) return irregular[normalized];
  if (normalized.length > 4 && normalized.endsWith('s') && !normalized.endsWith('is')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function hasAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(normalizeText(word)));
}

function inferAllergens(recipeItem: Recipe): Set<string> {
  const explicit = (recipeItem.allergens ?? []).map(normalizeText);
  const ingredients = normalizeText(recipeItem.ingredients.join(' '));
  const result = new Set(explicit);
  if (hasAny(ingredients, ['pão', 'farinha', 'massa', 'esparguete', 'aveia', 'trigo', 'cevada', 'centeio', 'cuscuz', 'couscous', 'tortilha', 'pão ralado'])) result.add('gluten');
  const containsDairy = recipeItem.ingredients.some((line) => {
    const ingredient = normalizeText(line);
    const dairy = hasAny(ingredient, ['queijo', 'iogurte', 'leite', 'manteiga', 'natas', 'parmesão', 'parmesao', 'ricotta']);
    const plantBasedDrink = hasAny(ingredient, ['leite de coco', 'bebida de soja', 'bebida de arroz', 'bebida de aveia', 'bebida de amêndoa', 'bebida de amendoa']);
    return dairy && !plantBasedDrink;
  });
  if (containsDairy) result.add('lactose');
  if (hasAny(ingredients, ['nozes', 'amêndoa', 'amendoa', 'avelã', 'avela', 'caju', 'pistácio', 'pistacio', 'castanha'])) result.add('frutos secos');
  if (hasAny(ingredients, ['amendoim', 'manteiga de amendoim'])) result.add('amendoim');
  if (hasAny(ingredients, ['camarão', 'camarao', 'marisco', 'gamba', 'mexilhão', 'mexilhao', 'lagosta', 'lula', 'polvo'])) result.add('marisco');
  if (hasAny(ingredients, ['atum', 'salmão', 'salmao', 'bacalhau', 'sardinha', 'pescada', 'peixe', 'filetes'])) result.add('peixe');
  if (hasAny(ingredients, ['ovo', 'ovos'])) result.add('ovos');
  if (hasAny(ingredients, ['soja', 'tofu', 'edamame', 'molho de soja', 'bebida de soja'])) result.add('soja');
  if (hasAny(ingredients, ['tahini', 'sésamo', 'sesamo'])) result.add('sésamo');
  return result;
}

function isVegetarian(recipeItem: Recipe): boolean {
  if (typeof recipeItem.vegetarian === 'boolean') return recipeItem.vegetarian;
  const ingredients = normalizeText(recipeItem.ingredients.join(' '));
  return !hasAny(ingredients, ['frango', 'carne', 'peru', 'porco', 'vaca', 'bacon', 'fiambre', 'atum', 'salmão', 'salmao', 'bacalhau', 'sardinha', 'pescada', 'peixe', 'camarão', 'camarao', 'marisco', 'gelatina']);
}

function isVegan(recipeItem: Recipe): boolean {
  if (typeof recipeItem.vegan === 'boolean') return recipeItem.vegan;
  if (!isVegetarian(recipeItem)) return false;
  const ingredients = normalizeText(recipeItem.ingredients.join(' '));
  return !hasAny(ingredients, ['leite', 'queijo', 'iogurte', 'manteiga', 'natas', 'ovo', 'ovos', 'mel', 'gelatina', 'parmesão', 'parmesao']);
}

function restrictionAllows(recipeItem: Recipe, restriction: string): boolean {
  const normalized = normalizeText(restriction);
  const allergens = inferAllergens(recipeItem);
  if (normalized === 'gluten') return !allergens.has('gluten');
  if (normalized === 'lactose') return !allergens.has('lactose');
  if (normalized === 'frutos secos') return !allergens.has('frutos secos');
  if (normalized === 'amendoim') return !allergens.has('amendoim');
  if (normalized === 'marisco') return !allergens.has('marisco');
  if (normalized === 'peixe') return !allergens.has('peixe');
  if (normalized === 'ovos') return !allergens.has('ovos');
  if (normalized === 'soja') return !allergens.has('soja');
  if (normalized === 'vegetariano') return isVegetarian(recipeItem);
  if (normalized === 'vegan') return isVegan(recipeItem);
  return true;
}

function recipeMatchesProfile(recipeItem: Recipe, profile: UserProfile): boolean {
  const restrictionMatch = profile.restrictions.every((restriction) => restrictionAllows(recipeItem, restriction));
  if (!restrictionMatch) return false;
  if (profile.maxCookTime === 'under30' && recipeItem.prepTime >= 30) return false;
  if (profile.maxCookTime === '30to60' && (recipeItem.prepTime < 30 || recipeItem.prepTime > 60)) return false;
  return true;
}

function previousApprovedPlan(weeks: WeekPlan[], weekStart: string): WeekPlan | undefined {
  return weeks
    .filter((week) => week.status === 'approved' && week.weekStart < weekStart)
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
}

export function getCompatibleRecipes(
  recipes: Recipe[],
  profile: UserProfile,
  weeks: WeekPlan[],
  weekStart = currentWeekStart(),
): Recipe[] {
  const recentIds = new Set(
    Object.values(previousApprovedPlan(weeks, weekStart)?.slots ?? {}).filter(
      (id): id is string => typeof id === 'string',
    ),
  );
  return recipes.filter(
    (item) => recipeMatchesProfile(item, profile) && !recentIds.has(item.id),
  );
}

function scoreRecipe(item: Recipe, profile: UserProfile, meal: string, seed: string): number {
  let score = item.category === meal ? 4 : item.category === 'Almoço' || item.category === 'Jantar' ? 1 : -2;
  if (profile.maxCookTime === 'over60') score += Math.min(6, Math.max(0, item.prepTime - 60) / 15);
  const cuisine = normalizeText(item.cuisine ?? '');
  if (profile.cuisines.some((choice) => cuisine.includes(normalizeText(choice).replace('tradicional ', '')))) score += 4;
  const ingredients = normalizeText(item.ingredients.join(' '));
  profile.preferredIngredients.forEach((preferred) => {
    const token = normalizeText(preferred);
    if (token && ingredients.includes(token)) score += 2;
  });
  let hash = 0;
  for (const char of `${seed}:${item.id}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return score + (hash % 1000) / 100000;
}

export function generateWeeklyProposal(
  recipes: Recipe[],
  profile: UserProfile,
  weeks: WeekPlan[],
  weekStart = currentWeekStart(),
): WeekPlan {
  const slots = makeEmptySlots();
  const eligible = getCompatibleRecipes(recipes, profile, weeks, weekStart);
  const usedThisWeek = new Set<string>();
  const batchPairs = new Set<string>();
  if (profile.cookingStyle === 'batch') {
    ['1-Almoço', '2-Almoço', '3-Almoço', '4-Almoço', '5-Almoço'].forEach((slot) => batchPairs.add(slot));
    ['0-Jantar', '1-Jantar', '2-Jantar', '3-Jantar', '4-Jantar', '5-Jantar'].forEach((slot) => batchPairs.add(slot));
  } else if (profile.cookingStyle === 'mixed') {
    ['1-Almoço', '3-Almoço', '6-Almoço', '0-Jantar', '2-Jantar', '5-Jantar'].forEach((slot) => batchPairs.add(slot));
  }

  for (let day = 0; day < 7; day += 1) {
    for (const meal of ['Almoço', 'Jantar']) {
      const key = `${day}-${meal}`;
      const repeatSource = meal === 'Almoço' && day > 0 && batchPairs.has(key)
        ? `${day - 1}-Jantar`
        : null;
      if (repeatSource && slots[repeatSource]) {
        slots[key] = slots[repeatSource];
        continue;
      }
      const candidates = [...eligible].sort(
        (a, b) => scoreRecipe(b, profile, meal, `${weekStart}-${key}`) - scoreRecipe(a, profile, meal, `${weekStart}-${key}`),
      );
      const freshChoice = candidates.find((item) => !usedThisWeek.has(item.id));
      const chosen = freshChoice ?? candidates[0];
      if (chosen) {
        slots[key] = chosen.id;
        usedThisWeek.add(chosen.id);
      }
    }
  }

  return { weekStart, slots, status: 'proposed', generatedAt: new Date().toISOString() };
}

function pantryHasIngredient(name: string, pantry: string[]): boolean {
  const key = normalizeIngredientName(name);
  return pantry.some((item) => {
    const pantryKey = normalizeIngredientName(item);
    return key === pantryKey || key.startsWith(`${pantryKey} `) || pantryKey.startsWith(`${key} `);
  });
}

const PRICE_RULES: Array<{ tokens: string[]; rate: number; basis: 'kg' | 'l' | 'unit' }> = [
  { tokens: ['ovo'], rate: 0.32, basis: 'unit' },
  { tokens: ['pao', 'pão'], rate: 0.18, basis: 'unit' },
  { tokens: ['abacate'], rate: 0.95, basis: 'unit' },
  { tokens: ['limao', 'limão', 'lima'], rate: 0.35, basis: 'unit' },
  { tokens: ['tomate'], rate: 2.9, basis: 'kg' },
  { tokens: ['cebola'], rate: 1.4, basis: 'kg' },
  { tokens: ['alho'], rate: 0.08, basis: 'unit' },
  { tokens: ['arroz', 'quinoa', 'lentilha', 'grao', 'grão', 'feijao', 'feijão', 'massa', 'esparguete', 'aveia', 'farinha'], rate: 2.6, basis: 'kg' },
  { tokens: ['azeite', 'oleo', 'óleo'], rate: 8.5, basis: 'l' },
  { tokens: ['leite de coco', 'bebida de coco'], rate: 2.8, basis: 'l' },
  { tokens: ['frango', 'peru'], rate: 8.5, basis: 'kg' },
  { tokens: ['salmao', 'salmão', 'bacalhau', 'pescada', 'atum', 'peixe'], rate: 13, basis: 'kg' },
  { tokens: ['camarao', 'camarão', 'marisco'], rate: 16, basis: 'kg' },
  { tokens: ['queijo', 'parmesao', 'parmesão'], rate: 12, basis: 'kg' },
  { tokens: ['iogurte'], rate: 0.45, basis: 'unit' },
  { tokens: ['banana', 'pera', 'pêra', 'maca', 'maçã', 'manga', 'cenoura', 'batata', 'curgete', 'pepino', 'pimento', 'abobora', 'abóbora'], rate: 2.2, basis: 'kg' },
  { tokens: ['espinafre', 'cogumelo', 'tomate cherry', 'frutos vermelhos'], rate: 7, basis: 'kg' },
  { tokens: ['noz', 'amendoa', 'amêndoa', 'caju', 'pistacio', 'pistácio'], rate: 15, basis: 'kg' },
  { tokens: ['mel', 'tahini', 'manteiga de amendoim'], rate: 8, basis: 'kg' },
  { tokens: ['sal', 'canela', 'pimenta', 'cominhos', 'caril'], rate: 0.12, basis: 'unit' },
];

function estimatedCost(line: string, parsed: ReturnType<typeof ingredientDetails>): number {
  const normalized = normalizeText(parsed.name);
  const rule = PRICE_RULES.find((candidate) => candidate.tokens.some((token) => normalized.includes(normalizeText(token))));
  const amount = parsed.amount ?? 1;
  const unit = parsed.unit ?? 'un';
  if (!rule) {
    if (unit === 'g' || unit === 'kg') return Math.max(0.08, (unit === 'kg' ? amount : amount / 1000) * 4.5);
    if (unit === 'ml' || unit === 'l') return Math.max(0.08, (unit === 'l' ? amount : amount / 1000) * 3);
    return 0.65;
  }
  if (rule.basis === 'kg') {
    if (unit === 'g') return Math.max(0.03, (amount / 1000) * rule.rate);
    if (unit === 'kg') return Math.max(0.03, amount * rule.rate);
    if (unit === 'colher') return Math.max(0.03, amount * 0.012 * rule.rate);
    return Math.max(0.03, amount * (rule.rate / 5));
  }
  if (rule.basis === 'l') {
    if (unit === 'ml') return Math.max(0.03, (amount / 1000) * rule.rate);
    if (unit === 'l') return Math.max(0.03, amount * rule.rate);
    if (unit === 'colher') return Math.max(0.03, amount * 0.015 * rule.rate);
    return Math.max(0.03, amount * (rule.rate / 4));
  }
  if (unit === 'g') return Math.max(0.03, amount * (rule.rate / 100));
  if (unit === 'kg') return Math.max(0.03, amount * rule.rate * 10);
  if (unit === 'ml') return Math.max(0.03, amount * (rule.rate / 100));
  if (unit === 'l') return Math.max(0.03, amount * rule.rate);
  if (unit === 'colher') return Math.max(0.03, amount * rule.rate * 0.15);
  return Math.max(0.03, amount * rule.rate);
}

function formatAmount(amount: number, unit: string): string {
  const display = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 }).format(amount);
  const unitLabels: Record<string, string> = {
    un: amount === 1 ? 'unidade' : 'unidades',
    g: 'g',
    kg: 'kg',
    ml: 'ml',
    l: 'l',
    dente: amount === 1 ? 'dente' : 'dentes',
    fatia: amount === 1 ? 'fatia' : 'fatias',
    colher: amount === 1 ? 'colher' : 'colheres',
    chavena: amount === 1 ? 'chávena' : 'chávenas',
    ramo: amount === 1 ? 'ramo' : 'ramos',
    lata: amount === 1 ? 'lata' : 'latas',
  };
  return `${display} ${unitLabels[unit] ?? unit}`;
}

export function buildShoppingList(
  recipes: Recipe[],
  plan: WeekPlan | null,
  profile: UserProfile | null,
  checks: Record<string, boolean>,
): GroceryItem[] {
  if (!plan || plan.status !== 'approved' || !profile) return [];
  const recipeMap = new Map(recipes.map((item) => [item.id, item]));
  const grouped = new Map<string, {
    name: string;
    count: number;
    cost: number;
    amounts: Map<string, number>;
    looseAmounts: string[];
  }>();

  Object.values(plan.slots).forEach((recipeId) => {
    if (!recipeId) return;
    const selected = recipeMap.get(recipeId);
    selected?.ingredients.forEach((line) => {
      const parsed = ingredientDetails(line);
      if (!parsed.key || pantryHasIngredient(parsed.name, profile.pantry)) return;
      const current = grouped.get(parsed.key) ?? {
        name: parsed.name.charAt(0).toLocaleUpperCase('pt-PT') + parsed.name.slice(1),
        count: 0,
        cost: 0,
        amounts: new Map<string, number>(),
        looseAmounts: [],
      };
      current.count += 1;
      current.cost += estimatedCost(line, parsed);
      if (parsed.amount !== null && parsed.unit) {
        current.amounts.set(parsed.unit, (current.amounts.get(parsed.unit) ?? 0) + parsed.amount);
      } else if (!current.looseAmounts.includes(line.trim())) {
        current.looseAmounts.push(line.trim());
      }
      grouped.set(parsed.key, current);
    });
  });

  return [...grouped.entries()]
    .map(([key, item]) => {
      const quantities = [...item.amounts.entries()].map(([unit, amount]) => formatAmount(amount, unit));
      const quantity = [...quantities, ...item.looseAmounts].join(' + ');
      return {
        key,
        name: item.name,
        quantity,
        checked: !!checks[key],
        count: item.count,
        estimatedPrice: Math.round(item.cost * 100) / 100,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
}
