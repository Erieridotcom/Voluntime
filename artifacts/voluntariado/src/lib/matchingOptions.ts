export const SKILLS = [
  "Comunicación",
  "Trabajo en equipo",
  "Enseñanza",
  "Diseño gráfico",
  "Fotografía",
  "Redes sociales",
  "Programación",
  "Primeros auxilios",
  "Inglés / idiomas",
  "Música",
  "Arte y pintura",
  "Carpintería",
  "Cocina",
  "Logística",
  "Edición de video",
  "Biología / Ecología",
  "Psicología",
  "Contabilidad",
  "Marketing",
  "Lenguaje de señas",
  "Conducción de vehículos",
  "Redacción",
];

export const INTERESTS = [
  "Medio ambiente",
  "Educación",
  "Salud",
  "Arte y Cultura",
  "Animales",
  "Comunidad",
  "Derechos humanos",
  "Tecnología",
  "Deportes",
  "Música",
  "Niñez",
  "Adultos mayores",
  "Discapacidad",
  "Sustentabilidad",
  "Migrantes",
  "Género",
];

export const ACCESSIBILITY_OPTIONS = [
  "Acceso en silla de ruedas",
  "Sin barreras físicas",
  "Guía de audio",
  "Lenguaje de señas",
  "Trabajo remoto",
  "Sin requisito de movilidad",
  "Materiales en braille",
  "Transporte accesible",
];

export const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Aguascalientes": [
    "Aguascalientes", "Calvillo", "Jesús María", "Pabellón de Arteaga", "Rincón de Romos",
  ],
  "Baja California": [
    "Tijuana", "Mexicali", "Ensenada", "Tecate", "Rosarito",
  ],
  "Baja California Sur": [
    "La Paz", "Los Cabos", "Loreto", "Comondú", "Mulegé",
  ],
  "Campeche": [
    "Campeche", "Ciudad del Carmen", "Calkiní", "Escárcega", "Champotón",
  ],
  "Chiapas": [
    "Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula", "Comitán", "Palenque", "Ocosingo",
  ],
  "Chihuahua": [
    "Chihuahua", "Ciudad Juárez", "Delicias", "Cuauhtémoc", "Hidalgo del Parral", "Nuevo Casas Grandes",
  ],
  "Ciudad de México": [
    "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa",
    "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "La Magdalena Contreras",
    "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco",
  ],
  "Coahuila": [
    "Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña", "Ramos Arizpe",
  ],
  "Colima": [
    "Colima", "Manzanillo", "Tecomán", "Villa de Álvarez", "Armería",
  ],
  "Durango": [
    "Durango", "Gómez Palacio", "Lerdo", "Santiago Papasquiaro", "El Salto",
  ],
  "Estado de México": [
    "Ecatepec de Morelos", "Nezahualcóyotl", "Naucalpan de Juárez", "Tlalnepantla de Baz",
    "Toluca", "Chimalhuacán", "Ixtapaluca", "Tultitlán", "Cuautitlán Izcalli", "Atizapán de Zaragoza",
    "Nicolás Romero", "Valle de Chalco", "Texcoco", "Metepec",
  ],
  "Guanajuato": [
    "Guanajuato", "León", "Irapuato", "Celaya", "Salamanca", "San Miguel de Allende",
    "Silao de la Victoria", "Acámbaro",
  ],
  "Guerrero": [
    "Chilpancingo", "Acapulco de Juárez", "Iguala de la Independencia", "Zihuatanejo",
    "Taxco de Alarcón", "Chilapa de Álvarez",
  ],
  "Hidalgo": [
    "Pachuca de Soto", "Tulancingo de Bravo", "Tula de Allende", "Actopan",
    "Ixmiquilpan", "Tepeji del Río",
  ],
  "Jalisco": [
    "Guadalajara", "Zapopan", "San Pedro Tlaquepaque", "Tonalá", "Tlajomulco de Zúñiga",
    "Puerto Vallarta", "Lagos de Moreno", "Tepatitlán de Morelos", "Ocotlán", "Ciudad Guzmán",
  ],
  "Michoacán": [
    "Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Apatzingán",
    "Pátzcuaro", "Zitácuaro", "Sahuayo",
  ],
  "Morelos": [
    "Cuernavaca", "Jiutepec", "Cuautla", "Temixco", "Yautepec", "Jojutla",
  ],
  "Nayarit": [
    "Tepic", "Bahía de Banderas", "Compostela", "Santiago Ixcuintla", "Xalisco", "Rosamorada",
  ],
  "Nuevo León": [
    "Monterrey", "San Nicolás de los Garza", "Guadalupe", "Apodaca",
    "San Pedro Garza García", "Santa Catarina", "General Escobedo", "Linares", "Montemorelos",
  ],
  "Oaxaca": [
    "Oaxaca de Juárez", "Salina Cruz", "Juchitán de Zaragoza", "Huatulco",
    "San Juan Bautista Tuxtepec", "Puerto Escondido", "Miahuatlán de Porfirio Díaz",
  ],
  "Puebla": [
    "Puebla de Zaragoza", "Tehuacán", "San Martín Texmelucan", "Atlixco",
    "Cholula", "Teziutlán", "Izúcar de Matamoros",
  ],
  "Querétaro": [
    "Querétaro", "San Juan del Río", "El Marqués", "Corregidora", "Huimilpan", "Cadereyta de Montes",
  ],
  "Quintana Roo": [
    "Cancún", "Playa del Carmen", "Chetumal", "Cozumel", "Tulum", "Felipe Carrillo Puerto",
  ],
  "San Luis Potosí": [
    "San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles",
    "Matehuala", "Rioverde", "Tamazunchale",
  ],
  "Sinaloa": [
    "Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Guamúchil", "Navolato",
  ],
  "Sonora": [
    "Hermosillo", "Ciudad Obregón", "Nogales", "San Luis Río Colorado",
    "Navojoa", "Guaymas", "Caborca",
  ],
  "Tabasco": [
    "Villahermosa", "Cárdenas", "Macuspana", "Comalcalco", "Paraíso", "Huimanguillo",
  ],
  "Tamaulipas": [
    "Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Ciudad Victoria",
    "Altamira", "Ciudad Madero",
  ],
  "Tlaxcala": [
    "Tlaxcala", "Apizaco", "Huamantla", "Calpulalpan", "Chiautempan", "Zacatelco",
  ],
  "Veracruz": [
    "Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Orizaba",
    "Poza Rica de Hidalgo", "Tuxpan", "Minatitlán", "Boca del Río",
  ],
  "Yucatán": [
    "Mérida", "Valladolid", "Kanasín", "Progreso", "Izamal", "Umán", "Tizimín",
  ],
  "Zacatecas": [
    "Zacatecas", "Guadalupe", "Fresnillo", "Jerez", "Calera", "Loreto",
  ],
};
