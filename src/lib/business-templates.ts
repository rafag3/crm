/**
 * Pre-defined business profile templates by segment.
 * Each template ships with a starter set of FAQ pairs the
 * user can edit, add to, or delete. They're not prescriptive —
 * they just save the customer from staring at a blank form.
 */

export interface FaqPair {
  id: string;
  question: string;
  answer: string;
}

export interface BusinessTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  defaultFaqs: Omit<FaqPair, 'id'>[];
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'pizzaria',
    label: 'Pizzaria / Restaurante',
    emoji: '🍕',
    description: 'Delivery, cardápio, horários e reservas',
    defaultFaqs: [
      { question: 'Qual é o horário de funcionamento?', answer: 'Funcionamos de terça a domingo, das 18h às 23h.' },
      { question: 'Vocês fazem entrega?', answer: 'Sim! Fazemos entrega nas regiões [bairros]. O prazo é de 40 a 60 minutos.' },
      { question: 'Qual é o pedido mínimo para delivery?', answer: 'O pedido mínimo para delivery é de R$ 30,00.' },
      { question: 'Onde fica a pizzaria?', answer: 'Estamos na [endereço completo].' },
      { question: 'Quais formas de pagamento vocês aceitam?', answer: 'Aceitamos dinheiro, cartão de débito/crédito e Pix.' },
      { question: 'Vocês têm opções sem glúten?', answer: 'Sim, temos massa sem glúten. Consulte disponibilidade.' },
      { question: 'Como faço para reservar uma mesa?', answer: 'É só nos chamar aqui no WhatsApp ou ligar em [telefone].' },
    ],
  },
  {
    id: 'lanchonete',
    label: 'Lanchonete / Fast Food',
    emoji: '🍔',
    description: 'Combos, delivery rápido e horários',
    defaultFaqs: [
      { question: 'Qual é o horário de funcionamento?', answer: 'Abrimos de segunda a sábado, das 10h às 22h. Domingos das 11h às 20h.' },
      { question: 'Vocês trabalham com delivery?', answer: 'Sim! Atendemos pela nossa central aqui no WhatsApp.' },
      { question: 'Qual é o tempo médio de entrega?', answer: 'O tempo médio de entrega é de 25 a 40 minutos.' },
      { question: 'Quais são as formas de pagamento?', answer: 'Aceitamos Pix, dinheiro e cartões de débito e crédito.' },
      { question: 'Vocês têm opção vegetariana?', answer: 'Sim! Temos [listar opções] no cardápio.' },
      { question: 'Têm combo para crianças?', answer: 'Sim, temos o [nome do combo infantil] com [o que inclui].' },
    ],
  },
  {
    id: 'salao',
    label: 'Salão de Beleza / Barbearia',
    emoji: '✂️',
    description: 'Agendamentos, serviços e preços',
    defaultFaqs: [
      { question: 'Quais serviços vocês oferecem?', answer: 'Oferecemos corte, coloração, hidratação, escova, manicure e pedicure.' },
      { question: 'Como faço para agendar?', answer: 'É só nos chamar aqui no WhatsApp! Nos diga o serviço desejado e vamos verificar os horários disponíveis.' },
      { question: 'Qual é o horário de atendimento?', answer: 'Atendemos de terça a sábado, das 9h às 19h.' },
      { question: 'Precisam agendar com antecedência?', answer: 'Recomendamos agendamento prévio. Atendemos encaixe quando há disponibilidade.' },
      { question: 'Qual o tempo médio de cada serviço?', answer: 'Corte: ~1h. Coloração: ~2-3h. Hidratação: ~1h. Escova: ~1h.' },
      { question: 'Quais as formas de pagamento?', answer: 'Aceitamos dinheiro, Pix e cartões.' },
      { question: 'Tem estacionamento?', answer: 'Temos vagas na frente do estabelecimento.' },
    ],
  },
  {
    id: 'petshop',
    label: 'Pet Shop / Veterinária',
    emoji: '🐾',
    description: 'Banho, tosa, consultas e produtos',
    defaultFaqs: [
      { question: 'Quais serviços vocês oferecem?', answer: 'Oferecemos banho, tosa, consultas veterinárias, vacinação e loja de produtos pet.' },
      { question: 'Como agendar banho e tosa?', answer: 'É só nos mandar mensagem! Precisamos saber a raça e o porte do pet para calcular o tempo e o valor.' },
      { question: 'Qual o horário de funcionamento?', answer: 'Segunda a sábado, das 8h às 18h.' },
      { question: 'Vocês buscam e entregam os animais?', answer: 'Sim! Fazemos busca e entrega mediante agendamento prévio. Consulte disponibilidade e tarifa.' },
      { question: 'Quanto custa o banho e tosa?', answer: 'O valor varia conforme o porte. A partir de R$ [valor] para pets pequenos.' },
      { question: 'A veterinária atende emergências?', answer: 'Para emergências ligue em [telefone]. O atendimento emergencial é [com/sem] agendamento.' },
    ],
  },
  {
    id: 'clinica',
    label: 'Clínica / Consultório',
    emoji: '🏥',
    description: 'Agendamentos, planos e especialidades',
    defaultFaqs: [
      { question: 'Quais especialidades vocês atendem?', answer: 'Atendemos [listar especialidades].' },
      { question: 'Como agendar uma consulta?', answer: 'Você pode agendar diretamente por aqui ou ligar em [telefone]. Nos diga a especialidade e seu convênio.' },
      { question: 'Quais convênios vocês aceitam?', answer: 'Aceitamos [listar convênios]. Também atendemos particular.' },
      { question: 'Qual o horário de funcionamento?', answer: 'Segunda a sexta, das 8h às 18h. Sábados das 8h às 12h.' },
      { question: 'Como funciona o retorno?', answer: 'O retorno é agendado diretamente com o médico após a consulta, sem custo adicional em até [X dias].' },
      { question: 'Vocês fazem exames no local?', answer: 'Sim, realizamos [listar exames disponíveis].' },
    ],
  },
  {
    id: 'loja',
    label: 'Loja / Boutique',
    emoji: '👗',
    description: 'Produtos, tamanhos, entrega e trocas',
    defaultFaqs: [
      { question: 'Como posso ver os produtos disponíveis?', answer: 'Nosso catálogo está atualizado aqui no WhatsApp e no Instagram [@perfil].' },
      { question: 'Vocês fazem entrega?', answer: 'Sim! Enviamos para todo o Brasil via Correios e transportadoras. O prazo varia por região.' },
      { question: 'Qual é a política de trocas?', answer: 'Aceitamos trocas em até [X dias] após a compra, com o produto sem uso e na embalagem original.' },
      { question: 'Qual o horário de funcionamento da loja física?', answer: 'Segunda a sábado, das 10h às 20h.' },
      { question: 'Quais as formas de pagamento?', answer: 'Aceitamos Pix (5% de desconto), cartão de débito/crédito e parcelamento em até [X]x.' },
      { question: 'Como saber meu tamanho?', answer: 'Temos uma tabela de medidas. Me diga as suas medidas de busto, cintura e quadril que eu te ajudo.' },
    ],
  },
  {
    id: 'academia',
    label: 'Academia / Studio',
    emoji: '💪',
    description: 'Planos, modalidades e horários',
    defaultFaqs: [
      { question: 'Quais modalidades vocês oferecem?', answer: 'Oferecemos [musculação, spinning, yoga, pilates — edite conforme sua academia].' },
      { question: 'Quais são os planos disponíveis?', answer: 'Temos planos mensais, trimestrais e semestrais. Solicite nossos valores aqui.' },
      { question: 'Qual o horário de funcionamento?', answer: 'Segunda a sexta das 6h às 22h. Sábado das 8h às 16h. Domingo das 9h às 13h.' },
      { question: 'Vocês têm aula experimental?', answer: 'Sim! A primeira aula é gratuita. Agende aqui no WhatsApp.' },
      { question: 'Tem estacionamento?', answer: 'Sim, temos estacionamento gratuito para alunos.' },
      { question: 'Preciso levar algum material?', answer: 'Recomendamos trazer toalha, garrafa de água e roupa adequada. Temos armários disponíveis.' },
    ],
  },
  {
    id: 'imobiliaria',
    label: 'Imobiliária / Corretor',
    emoji: '🏠',
    description: 'Imóveis, visitas e financiamento',
    defaultFaqs: [
      { question: 'Vocês trabalham com venda e locação?', answer: 'Sim, trabalhamos com venda, locação e temporada na região [regiões atendidas].' },
      { question: 'Como agendar uma visita?', answer: 'É só nos chamar aqui! Nos diga o imóvel de interesse e encontramos um horário.' },
      { question: 'Vocês auxiliam no financiamento?', answer: 'Sim! Temos parceria com os principais bancos e podemos simular o financiamento sem compromisso.' },
      { question: 'Qual documentação é necessária para alugar?', answer: 'Geralmente: RG, CPF, comprovante de renda e residência. Cada proprietário pode solicitar garantias adicionais.' },
      { question: 'Vocês cobram taxa de administração?', answer: 'Para locação cobramos [X]% do valor do aluguel pela administração do contrato.' },
    ],
  },
  {
    id: 'outro',
    label: 'Outro segmento',
    emoji: '🏢',
    description: 'Modelo genérico — personalize como quiser',
    defaultFaqs: [
      { question: 'Qual é o horário de atendimento?', answer: 'Atendemos de segunda a sexta, das 9h às 18h.' },
      { question: 'Onde vocês estão localizados?', answer: '[Endereço completo]' },
      { question: 'Quais são as formas de pagamento?', answer: 'Aceitamos Pix, dinheiro e cartão.' },
      { question: 'Como entro em contato?', answer: 'Pode nos chamar aqui no WhatsApp a qualquer momento!' },
    ],
  },
];
