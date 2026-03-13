'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import styles from './page.module.css';

const TRAITS = [
  {
    id: 'minimal-calm',
    name: '미니멀 고요형',
    summary: '여백과 질서, 조용한 긴장을 선호해요.',
    artists: [
      { name: 'Agnes Martin', url: 'https://en.wikipedia.org/wiki/Agnes_Martin' },
      { name: 'Donald Judd', url: 'https://en.wikipedia.org/wiki/Donald_Judd' },
    ],
    venues: [
      { name: 'Dia Beacon', city: 'New York', url: 'https://www.diaart.org/visit/visit/diabeacon-beacon-united-states' },
      { name: 'Leeum Museum of Art', city: 'Seoul', url: 'https://www.leeumhoam.org/' },
    ],
  },
  {
    id: 'color-pop',
    name: '컬러 팝형',
    summary: '강한 색 대비와 즉각적인 에너지에 반응해요.',
    artists: [
      { name: 'Yayoi Kusama', url: 'https://en.wikipedia.org/wiki/Yayoi_Kusama' },
      { name: 'David Hockney', url: 'https://en.wikipedia.org/wiki/David_Hockney' },
    ],
    venues: [
      { name: 'Tate Modern', city: 'London', url: 'https://www.tate.org.uk/visit/tate-modern' },
      { name: 'Mori Art Museum', city: 'Tokyo', url: 'https://www.mori.art.museum/en/' },
    ],
  },
  {
    id: 'gestural-abstract',
    name: '제스처 추상형',
    summary: '붓질과 흔적, 물감의 물성을 중요하게 봐요.',
    artists: [
      { name: 'Gerhard Richter', url: 'https://en.wikipedia.org/wiki/Gerhard_Richter' },
      { name: 'Joan Mitchell', url: 'https://en.wikipedia.org/wiki/Joan_Mitchell' },
    ],
    venues: [
      { name: 'Centre Pompidou', city: 'Paris', url: 'https://www.centrepompidou.fr/en/' },
      { name: 'National Museum of Modern and Contemporary Art', city: 'Seoul', url: 'https://www.mmca.go.kr/' },
    ],
  },
  {
    id: 'surreal-dream',
    name: '초현실 몽환형',
    summary: '꿈, 무의식, 상징이 섞인 이미지에 끌려요.',
    artists: [
      { name: 'Leonora Carrington', url: 'https://en.wikipedia.org/wiki/Leonora_Carrington' },
      { name: 'Salvador Dali', url: 'https://en.wikipedia.org/wiki/Salvador_Dal%C3%AD' },
    ],
    venues: [
      { name: 'Museo Reina Sofia', city: 'Madrid', url: 'https://www.museoreinasofia.es/en' },
      { name: 'Seoul Museum of Art', city: 'Seoul', url: 'https://sema.seoul.go.kr/' },
    ],
  },
  {
    id: 'figurative-realism',
    name: '구상 리얼리즘형',
    summary: '인물과 사물의 구체적 표현에서 몰입을 느껴요.',
    artists: [
      { name: 'Lucian Freud', url: 'https://en.wikipedia.org/wiki/Lucian_Freud' },
      { name: 'Jenny Saville', url: 'https://en.wikipedia.org/wiki/Jenny_Saville' },
    ],
    venues: [
      { name: 'The National Gallery', city: 'London', url: 'https://www.nationalgallery.org.uk/' },
      { name: 'Seoul Arts Center (Hangaram)', city: 'Seoul', url: 'https://www.sac.or.kr/' },
    ],
  },
  {
    id: 'narrative-scene',
    name: '서사 장면형',
    summary: '이야기가 보이는 장면 구성에 흥미를 느껴요.',
    artists: [
      { name: 'Kerry James Marshall', url: 'https://en.wikipedia.org/wiki/Kerry_James_Marshall' },
      { name: 'Peter Doig', url: 'https://en.wikipedia.org/wiki/Peter_Doig' },
    ],
    venues: [
      { name: 'Whitney Museum of American Art', city: 'New York', url: 'https://whitney.org/' },
      { name: 'Busan Museum of Art', city: 'Busan', url: 'https://www.busan.go.kr/moca/' },
    ],
  },
  {
    id: 'conceptual-idea',
    name: '개념 아이디어형',
    summary: '보이는 결과보다 아이디어 구조를 먼저 봐요.',
    artists: [
      { name: 'Sol LeWitt', url: 'https://en.wikipedia.org/wiki/Sol_LeWitt' },
      { name: 'Joseph Kosuth', url: 'https://en.wikipedia.org/wiki/Joseph_Kosuth' },
    ],
    venues: [
      { name: 'MoMA', city: 'New York', url: 'https://www.moma.org/' },
      { name: 'National Museum of Modern and Contemporary Art', city: 'Seoul', url: 'https://www.mmca.go.kr/' },
    ],
  },
  {
    id: 'social-political',
    name: '사회비평형',
    summary: '사회, 권력, 메시지가 분명한 작업을 선호해요.',
    artists: [
      { name: 'Ai Weiwei', url: 'https://en.wikipedia.org/wiki/Ai_Weiwei' },
      { name: 'Barbara Kruger', url: 'https://en.wikipedia.org/wiki/Barbara_Kruger' },
    ],
    venues: [
      { name: 'ICA Boston', city: 'Boston', url: 'https://www.icaboston.org/' },
      { name: 'Ilmin Museum of Art', city: 'Seoul', url: 'https://www.ilmin.org/' },
    ],
  },
  {
    id: 'identity-gender',
    name: '정체성 탐구형',
    summary: '몸, 젠더, 정체성의 층위를 깊게 읽는 편이에요.',
    artists: [
      { name: 'Cindy Sherman', url: 'https://en.wikipedia.org/wiki/Cindy_Sherman' },
      { name: 'Mickalene Thomas', url: 'https://en.wikipedia.org/wiki/Mickalene_Thomas' },
    ],
    venues: [
      { name: 'Brooklyn Museum', city: 'New York', url: 'https://www.brooklynmuseum.org/' },
      { name: 'Seoul Museum of Art', city: 'Seoul', url: 'https://sema.seoul.go.kr/' },
    ],
  },
  {
    id: 'body-performance',
    name: '퍼포먼스 몰입형',
    summary: '행위와 시간, 신체성이 강한 작업을 좋아해요.',
    artists: [
      { name: 'Marina Abramovic', url: 'https://en.wikipedia.org/wiki/Marina_Abramovi%C4%87' },
      { name: 'Tehching Hsieh', url: 'https://en.wikipedia.org/wiki/Tehching_Hsieh' },
    ],
    venues: [
      { name: 'The Kitchen', city: 'New York', url: 'https://thekitchen.org/' },
      { name: 'Arko Art Center', city: 'Seoul', url: 'https://arko.or.kr/artcenter/' },
    ],
  },
  {
    id: 'nature-ecology',
    name: '자연 생태형',
    summary: '자연, 환경, 생태 감수성 기반 작품에 반응해요.',
    artists: [
      { name: 'Olafur Eliasson', url: 'https://en.wikipedia.org/wiki/Olafur_Eliasson' },
      { name: 'Andy Goldsworthy', url: 'https://en.wikipedia.org/wiki/Andy_Goldsworthy' },
    ],
    venues: [
      { name: 'Louisiana Museum of Modern Art', city: 'Humlebæk', url: 'https://louisiana.dk/en/' },
      { name: 'Jeju Museum of Contemporary Art', city: 'Jeju', url: 'https://www.jeju.go.kr/jejumoca/index.htm' },
    ],
  },
  {
    id: 'urban-street',
    name: '도시 스트리트형',
    summary: '도시의 속도감, 거리 문화, 현장성을 선호해요.',
    artists: [
      { name: 'Banksy', url: 'https://en.wikipedia.org/wiki/Banksy' },
      { name: 'JR', url: 'https://en.wikipedia.org/wiki/JR_(artist)' },
    ],
    venues: [
      { name: 'Urban Nation', city: 'Berlin', url: 'https://urban-nation.com/' },
      { name: 'Daelim Museum (Photo/Design Program)', city: 'Seoul', url: 'https://daelimmuseum.org/' },
    ],
  },
  {
    id: 'light-space',
    name: '빛공간 몰입형',
    summary: '빛과 공간 변화가 만드는 감각 경험을 중시해요.',
    artists: [
      { name: 'James Turrell', url: 'https://en.wikipedia.org/wiki/James_Turrell' },
      { name: 'Olafur Eliasson', url: 'https://en.wikipedia.org/wiki/Olafur_Eliasson' },
    ],
    venues: [
      { name: 'teamLab Planets', city: 'Tokyo', url: 'https://www.teamlab.art/e/planets/' },
      { name: 'Pace Gallery Seoul', city: 'Seoul', url: 'https://www.pacegallery.com/locations/seoul/' },
    ],
  },
  {
    id: 'new-media-tech',
    name: '뉴미디어 테크형',
    summary: '영상, 데이터, 인터랙션 중심 작업을 선호해요.',
    artists: [
      { name: 'Rafael Lozano-Hemmer', url: 'https://en.wikipedia.org/wiki/Rafael_Lozano-Hemmer' },
      { name: 'Ryoji Ikeda', url: 'https://en.wikipedia.org/wiki/Ryoji_Ikeda' },
    ],
    venues: [
      { name: 'Ars Electronica Center', city: 'Linz', url: 'https://ars.electronica.art/center/en/' },
      { name: 'Dongdaemun Design Plaza', city: 'Seoul', url: 'https://www.ddp.or.kr/' },
    ],
  },
  {
    id: 'photo-documentary',
    name: '포토 다큐형',
    summary: '현실의 기록성과 순간의 진정성을 중요하게 봐요.',
    artists: [
      { name: 'Nan Goldin', url: 'https://en.wikipedia.org/wiki/Nan_Goldin' },
      { name: 'Wolfgang Tillmans', url: 'https://en.wikipedia.org/wiki/Wolfgang_Tillmans' },
    ],
    venues: [
      { name: 'The Photographers Gallery', city: 'London', url: 'https://thephotographersgallery.org.uk/' },
      { name: 'Museum Hanmi', city: 'Seoul', url: 'https://www.museumhanmi.or.kr/' },
    ],
  },
  {
    id: 'material-craft',
    name: '재료 공예형',
    summary: '직물, 금속, 손작업의 촉감과 물성을 즐겨요.',
    artists: [
      { name: 'Sheila Hicks', url: 'https://en.wikipedia.org/wiki/Sheila_Hicks' },
      { name: 'El Anatsui', url: 'https://en.wikipedia.org/wiki/El_Anatsui' },
    ],
    venues: [
      { name: 'V&A Museum', city: 'London', url: 'https://www.vam.ac.uk/' },
      { name: 'Cheongju Craft Biennale', city: 'Cheongju', url: 'https://www.okcj.org/' },
    ],
  },
  {
    id: 'object-installation',
    name: '오브제 설치형',
    summary: '사물 배치와 공간 연출 자체를 작품으로 즐겨요.',
    artists: [
      { name: 'Anish Kapoor', url: 'https://en.wikipedia.org/wiki/Anish_Kapoor' },
      { name: 'Do Ho Suh', url: 'https://en.wikipedia.org/wiki/Do_Ho_Suh' },
    ],
    venues: [
      { name: 'Guggenheim Bilbao', city: 'Bilbao', url: 'https://www.guggenheim-bilbao.eus/en' },
      { name: 'Leeum Museum of Art', city: 'Seoul', url: 'https://www.leeumhoam.org/' },
    ],
  },
  {
    id: 'history-myth',
    name: '역사 신화형',
    summary: '역사와 신화를 현대적으로 재해석한 작업에 끌려요.',
    artists: [
      { name: 'Kehinde Wiley', url: 'https://en.wikipedia.org/wiki/Kehinde_Wiley' },
      { name: 'Kiki Smith', url: 'https://en.wikipedia.org/wiki/Kiki_Smith' },
    ],
    venues: [
      { name: 'The Met', city: 'New York', url: 'https://www.metmuseum.org/' },
      { name: 'National Museum of Korea', city: 'Seoul', url: 'https://www.museum.go.kr/' },
    ],
  },
  {
    id: 'dark-grotesque',
    name: '다크 그로테스크형',
    summary: '불안, 왜곡, 어두운 정서의 강도를 즐겨요.',
    artists: [
      { name: 'Francis Bacon', url: 'https://en.wikipedia.org/wiki/Francis_Bacon_(artist)' },
      { name: 'Louise Bourgeois', url: 'https://en.wikipedia.org/wiki/Louise_Bourgeois' },
    ],
    venues: [
      { name: 'Hamburger Bahnhof', city: 'Berlin', url: 'https://www.smb.museum/en/museums-institutions/hamburger-bahnhof/' },
      { name: 'Museum of Contemporary Art Australia', city: 'Sydney', url: 'https://www.mca.com.au/' },
    ],
  },
  {
    id: 'meditative-poetic',
    name: '서정 명상형',
    summary: '느린 호흡, 감정의 여운, 시적 분위기를 선호해요.',
    artists: [
      { name: 'Mark Rothko', url: 'https://en.wikipedia.org/wiki/Mark_Rothko' },
      { name: 'Lee Ufan', url: 'https://en.wikipedia.org/wiki/Lee_Ufan' },
    ],
    venues: [
      { name: 'Rothko Chapel', city: 'Houston', url: 'https://www.rothkochapel.org/' },
      { name: 'Leeum Museum of Art', city: 'Seoul', url: 'https://www.leeumhoam.org/' },
    ],
  },
];

const QUIZ_ITEMS = [
  {
    id: 'i1',
    type: 'image',
    prompt: '아래 무드 이미지 중 지금 가장 끌리는 화면을 골라주세요.',
    options: [
      { label: '고요한 구조와 여백', traitId: 'minimal-calm', imageUrl: '/trait-cards/minimal-calm.svg' },
      { label: '강한 색 에너지', traitId: 'color-pop', imageUrl: '/trait-cards/color-pop.svg' },
      { label: '붓질 흔적의 밀도', traitId: 'gestural-abstract', imageUrl: '/trait-cards/gestural-abstract.svg' },
      { label: '명상적인 잔향', traitId: 'meditative-poetic', imageUrl: '/trait-cards/meditative-poetic.svg' },
    ],
  },
  {
    id: 'i2',
    type: 'image',
    prompt: '인물/장면 계열 중 취향에 더 가까운 이미지를 골라주세요.',
    options: [
      { label: '구체적 대상의 존재감', traitId: 'figurative-realism', imageUrl: '/trait-cards/figurative-realism.svg' },
      { label: '꿈처럼 낯선 전개', traitId: 'surreal-dream', imageUrl: '/trait-cards/surreal-dream.svg' },
      { label: '불편하지만 강렬한 정서', traitId: 'dark-grotesque', imageUrl: '/trait-cards/dark-grotesque.svg' },
      { label: '이야기가 보이는 장면', traitId: 'narrative-scene', imageUrl: '/trait-cards/narrative-scene.svg' },
    ],
  },
  {
    id: 'i3',
    type: 'image',
    prompt: '전시 설명 없이 봐도 더 흥미로운 이미지는?',
    options: [
      { label: '아이디어 중심 구성', traitId: 'conceptual-idea', imageUrl: '/trait-cards/conceptual-idea.svg' },
      { label: '공간을 점유하는 오브제', traitId: 'object-installation', imageUrl: '/trait-cards/object-installation.svg' },
      { label: '재료의 촉감과 결', traitId: 'material-craft', imageUrl: '/trait-cards/material-craft.svg' },
      { label: '역사/신화의 잔상', traitId: 'history-myth', imageUrl: '/trait-cards/history-myth.svg' },
    ],
  },
  {
    id: 'i4',
    type: 'image',
    prompt: '주제성이 강한 작업 중 더 오래 보고 싶은 쪽은?',
    options: [
      { label: '사회/정치 이슈가 보임', traitId: 'social-political', imageUrl: '/trait-cards/social-political.svg' },
      { label: '몸과 정체성의 감각', traitId: 'identity-gender', imageUrl: '/trait-cards/identity-gender.svg' },
      { label: '거리와 도시의 속도감', traitId: 'urban-street', imageUrl: '/trait-cards/urban-street.svg' },
      { label: '기록과 관찰의 시선', traitId: 'photo-documentary', imageUrl: '/trait-cards/photo-documentary.svg' },
    ],
  },
  {
    id: 'i5',
    type: 'image',
    prompt: '몰입형 전시를 간다면 어떤 감각을 원하나요?',
    options: [
      { label: '빛이 공간을 바꾸는 감각', traitId: 'light-space', imageUrl: '/trait-cards/light-space.svg' },
      { label: '기술 기반 실험성', traitId: 'new-media-tech', imageUrl: '/trait-cards/new-media-tech.svg' },
      { label: '몸으로 체감하는 긴장', traitId: 'body-performance', imageUrl: '/trait-cards/body-performance.svg' },
      { label: '자연/생태의 흐름', traitId: 'nature-ecology', imageUrl: '/trait-cards/nature-ecology.svg' },
    ],
  },
  {
    id: 'i6',
    type: 'image',
    prompt: '다시 한 번, 즉시 클릭하게 되는 무드 이미지를 선택해주세요.',
    options: [
      { label: '정돈된 미니멀', traitId: 'minimal-calm', imageUrl: '/trait-cards/minimal-calm.svg' },
      { label: '공간 오브제 중심', traitId: 'object-installation', imageUrl: '/trait-cards/object-installation.svg' },
      { label: '팝한 시각 임팩트', traitId: 'color-pop', imageUrl: '/trait-cards/color-pop.svg' },
      { label: '기록사진 같은 현실감', traitId: 'photo-documentary', imageUrl: '/trait-cards/photo-documentary.svg' },
    ],
  },
  {
    id: 'i7',
    type: 'image',
    prompt: '실험적 성향을 가늠할 마지막 이미지 선택입니다.',
    options: [
      { label: '물성과 제스처의 추상', traitId: 'gestural-abstract', imageUrl: '/trait-cards/gestural-abstract.svg' },
      { label: '초현실적 상상력', traitId: 'surreal-dream', imageUrl: '/trait-cards/surreal-dream.svg' },
      { label: '메시지 우선 이미지', traitId: 'social-political', imageUrl: '/trait-cards/social-political.svg' },
      { label: '디지털 기반 감각', traitId: 'new-media-tech', imageUrl: '/trait-cards/new-media-tech.svg' },
    ],
  },
  {
    id: 'q8',
    type: 'image',
    prompt: '설명문이 붙은 전시라면 어떤 문장에 먼저 반응하나요?',
    options: [
      { label: '이야기 흐름이 촘촘하다', traitId: 'narrative-scene' },
      { label: '개념 구조가 날카롭다', traitId: 'conceptual-idea' },
      { label: '정체성의 층위가 깊다', traitId: 'identity-gender' },
      { label: '역사 해석이 새롭다', traitId: 'history-myth' },
    ],
  },
  {
    id: 'q9',
    type: 'text',
    prompt: '전시장 체류 시간을 늘리는 요인은 무엇에 가깝나요?',
    options: [
      { label: '인물/대상의 실재감', traitId: 'figurative-realism' },
      { label: '재료와 제작 밀도', traitId: 'material-craft' },
      { label: '몸으로 느끼는 퍼포먼스', traitId: 'body-performance' },
      { label: '환경 맥락과 생태 감수성', traitId: 'nature-ecology' },
    ],
  },
  {
    id: 'q10',
    type: 'text',
    prompt: '결국 “내 취향이다”라고 확신하게 하는 마지막 기준은?',
    options: [
      { label: '도시적인 현장감', traitId: 'urban-street' },
      { label: '빛과 공간의 몰입감', traitId: 'light-space' },
      { label: '다크하고 강한 정서', traitId: 'dark-grotesque' },
      { label: '잔잔하게 오래 남는 여운', traitId: 'meditative-poetic' },
    ],
  },
];

const ARTWORK_IMAGE_BY_TRAIT = {
  'minimal-calm': '/trait-artworks/minimal-calm.jpg',
  'color-pop': '/trait-artworks/color-pop.jpg',
  'gestural-abstract': '/trait-artworks/gestural-abstract.jpg',
  'figurative-realism': '/trait-artworks/figurative-realism.jpg',
  'narrative-scene': '/trait-artworks/narrative-scene.jpg',
  'conceptual-idea': '/trait-artworks/conceptual-idea.jpg',
  'surreal-dream': '/trait-artworks/surreal-dream.jpg',
  'social-political': '/trait-artworks/social-political.jpg',
  'identity-gender': '/trait-artworks/identity-gender.jpg',
  'body-performance': '/trait-artworks/body-performance.jpg',
  'nature-ecology': '/trait-artworks/nature-ecology.jpg',
  'urban-street': '/trait-artworks/urban-street.jpg',
  'light-space': '/trait-artworks/light-space.jpg',
  'photo-documentary': '/trait-artworks/photo-documentary.jpg',
  'material-craft': '/trait-artworks/material-craft.jpg',
  'history-myth': '/trait-artworks/history-myth.jpg',
  'dark-grotesque': '/trait-artworks/dark-grotesque.jpg',
  'meditative-poetic': '/trait-artworks/meditative-poetic.jpg',
  'new-media-tech': '/trait-artworks/new-media-tech.jpg',
  'object-installation': '/trait-artworks/object-installation.jpg',
};

const IMAGE_ITEM_COUNT = QUIZ_ITEMS.filter((item) => item.type === 'image').length;
const TEXT_ITEM_COUNT = QUIZ_ITEMS.length - IMAGE_ITEM_COUNT;

const TRAIT_MAP = new Map(TRAITS.map((trait) => [trait.id, trait]));

function buildScoreMap(answers) {
  const scores = new Map(TRAITS.map((trait) => [trait.id, 0]));

  for (const answer of answers) {
    if (!answer || !scores.has(answer)) continue;
    scores.set(answer, scores.get(answer) + 1);
  }

  return scores;
}

function rankTraits(scores) {
  return TRAITS.map((trait) => ({
    ...trait,
    score: scores.get(trait.id) || 0,
  })).sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'ko'));
}

function axisLetter(scores, positiveSet, positiveLetter, negativeLetter) {
  let value = 0;

  for (const [traitId, score] of scores) {
    value += positiveSet.has(traitId) ? score : -score;
  }

  return value >= 0 ? positiveLetter : negativeLetter;
}

function buildProfileCode(scores) {
  const orderlySet = new Set([
    'minimal-calm',
    'meditative-poetic',
    'figurative-realism',
    'history-myth',
    'material-craft',
    'photo-documentary',
  ]);
  const formSet = new Set([
    'figurative-realism',
    'gestural-abstract',
    'material-craft',
    'photo-documentary',
    'light-space',
    'object-installation',
  ]);
  const humanSet = new Set([
    'figurative-realism',
    'narrative-scene',
    'identity-gender',
    'body-performance',
    'social-political',
    'photo-documentary',
  ]);
  const analogSet = new Set([
    'material-craft',
    'gestural-abstract',
    'figurative-realism',
    'history-myth',
    'meditative-poetic',
    'minimal-calm',
    'surreal-dream',
  ]);

  const l1 = axisLetter(scores, orderlySet, 'C', 'D');
  const l2 = axisLetter(scores, formSet, 'F', 'I');
  const l3 = axisLetter(scores, humanSet, 'H', 'E');
  const l4 = axisLetter(scores, analogSet, 'A', 'T');

  return `${l1}${l2}${l3}${l4}`;
}

function profileSummary(topTraits) {
  const [first, second, third] = topTraits;
  if (!first) return '데이터가 부족해서 성향을 계산하지 못했어요.';

  const picks = [first?.name, second?.name, third?.name].filter(Boolean).join(' · ');
  return `${picks} 성향이 강합니다. 시각 스타일뿐 아니라 주제와 매체 선택까지 뚜렷한 취향을 보여요.`;
}

function aggregateRecommendations(topTraits) {
  const artistCounter = new Map();
  const venueCounter = new Map();

  for (const trait of topTraits) {
    for (const artist of trait.artists) {
      const key = artist.name;
      const prev = artistCounter.get(key) || { ...artist, score: 0 };
      artistCounter.set(key, { ...prev, score: prev.score + 1 });
    }

    for (const venue of trait.venues) {
      const key = venue.name;
      const prev = venueCounter.get(key) || { ...venue, score: 0 };
      venueCounter.set(key, { ...prev, score: prev.score + 1 });
    }
  }

  const artists = [...artistCounter.values()]
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'en'))
    .slice(0, 4);

  const venues = [...venueCounter.values()]
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'en'))
    .slice(0, 4);

  return { artists, venues };
}

export default function ArtistMatchPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUIZ_ITEMS.length).fill(null));

  const currentQuestion = QUIZ_ITEMS[step] || null;
  const isComplete = step >= QUIZ_ITEMS.length;
  const answeredCount = answers.filter(Boolean).length;

  const result = useMemo(() => {
    if (!isComplete) return null;

    const scores = buildScoreMap(answers);
    const ranked = rankTraits(scores);
    const topTraits = ranked.filter((trait) => trait.score > 0).slice(0, 3);
    const fallbackTopTraits = topTraits.length > 0 ? topTraits : ranked.slice(0, 3);
    const profileCode = buildProfileCode(scores);
    const recommendation = aggregateRecommendations(fallbackTopTraits);

    return {
      profileCode,
      ranked,
      topTraits: fallbackTopTraits,
      summary: profileSummary(fallbackTopTraits),
      recommendation,
    };
  }, [answers, isComplete]);

  const selectAnswer = (traitId) => {
    setAnswers((previous) => {
      const next = [...previous];
      next[step] = traitId;
      return next;
    });

    setStep((previous) => Math.min(previous + 1, QUIZ_ITEMS.length));
  };

  const movePrev = () => {
    setStep((previous) => Math.max(previous - 1, 0));
  };

  const restart = () => {
    setAnswers(Array(QUIZ_ITEMS.length).fill(null));
    setStep(0);
  };

  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          메뉴로
        </Link>
        <h1>작품 성향 테스트</h1>
        <p>이미지 선택 중심으로 취향을 분석하고, 마지막에 짧은 질문으로 성향을 보정해요.</p>
        <p className={styles.mixMeta}>
          이미지 {IMAGE_ITEM_COUNT}문항 · 질문 {TEXT_ITEM_COUNT}문항 (
          {Math.round((IMAGE_ITEM_COUNT / QUIZ_ITEMS.length) * 100)}:
          {Math.round((TEXT_ITEM_COUNT / QUIZ_ITEMS.length) * 100)})
        </p>
      </header>

      {!isComplete && currentQuestion && (
        <>
          <section className={styles.progressPanel} aria-live="polite">
            <div className={styles.progressText}>
              <strong>
                {step + 1} / {QUIZ_ITEMS.length}
              </strong>
              <span>{Math.round(((step + 1) / QUIZ_ITEMS.length) * 100)}% 진행</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${((step + 1) / QUIZ_ITEMS.length) * 100}%` }} />
            </div>
          </section>

          <section className={styles.questionPanel}>
            <p className={styles.questionLabel}>
              {currentQuestion.type === 'image' ? '이미지 선택' : '질문 응답'} · Q{step + 1}
            </p>
            <h2>{currentQuestion.prompt}</h2>

            {currentQuestion.type === 'image' ? (
              <div className={styles.imageGrid}>
                {currentQuestion.options.map((option, index) => {
                  const trait = TRAIT_MAP.get(option.traitId);
                  const imageUrl =
                    ARTWORK_IMAGE_BY_TRAIT[option.traitId] || option.imageUrl || `/trait-cards/${option.traitId}.svg`;
                  return (
                    <button
                      type="button"
                      key={`${currentQuestion.id}-${option.traitId}-${index}`}
                      className={styles.imageOption}
                      onClick={() => selectAnswer(option.traitId)}
                    >
                      <div className={styles.imageFrame}>
                        <img src={imageUrl} alt={option.label} loading="lazy" />
                      </div>
                      <div className={styles.optionMeta}>
                        <strong>{option.label}</strong>
                        <span>{trait?.name || '취향 성향'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.optionsGrid}>
                {currentQuestion.options.map((option, index) => {
                  const trait = TRAIT_MAP.get(option.traitId);
                  return (
                    <button
                      type="button"
                      key={`${currentQuestion.id}-${option.traitId}-${index}`}
                      className={styles.optionCard}
                      onClick={() => selectAnswer(option.traitId)}
                    >
                      <strong>{option.label}</strong>
                      <span>{trait?.name || '취향 성향'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.altButton} onClick={movePrev} disabled={step === 0}>
                이전
              </button>
              <span className={styles.hint}>현재 {answeredCount}개 답변 완료</span>
            </div>
          </section>
        </>
      )}

      {isComplete && result && (
        <section className={styles.resultPanel}>
          <p className={styles.resultLabel}>테스트 결과</p>
          <h2>
            당신의 작품 성향 코드: <em>{result.profileCode}</em>
          </h2>
          <p className={styles.summary}>{result.summary}</p>

          <div className={styles.traitList}>
            {result.topTraits.map((trait) => (
              <article key={trait.id} className={styles.traitCard}>
                <strong>
                  {trait.name} · {trait.score}점
                </strong>
                <p>{trait.summary}</p>
              </article>
            ))}
          </div>

          <div className={styles.recommendGrid}>
            <section className={styles.recommendPanel}>
              <h3>추천 작가</h3>
              <ul>
                {result.recommendation.artists.map((artist) => (
                  <li key={artist.name}>
                    <a href={artist.url} target="_blank" rel="noreferrer">
                      {artist.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.recommendPanel}>
              <h3>추천 전시장</h3>
              <ul>
                {result.recommendation.venues.map((venue) => (
                  <li key={venue.name}>
                    <a href={venue.url} target="_blank" rel="noreferrer">
                      {venue.name}
                    </a>
                    <span>{venue.city}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.mainButton} onClick={restart}>
              다시 테스트하기
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
