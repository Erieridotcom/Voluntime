CITIES_BY_STATE: dict[str, list[str]] = {
    "Aguascalientes": [
        "Aguascalientes", "Calvillo", "Jesús María", "Pabellón de Arteaga",
        "Rincón de Romos", "San Francisco de los Romo", "Tepezalá",
    ],
    "Baja California": [
        "Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate",
        "San Quintín", "San Felipe",
    ],
    "Baja California Sur": [
        "La Paz", "Los Cabos (Cabo San Lucas)", "Loreto", "Mulegé",
        "Comondú", "Ciudad Constitución",
    ],
    "Campeche": [
        "Campeche", "Ciudad del Carmen", "Champotón", "Calkiní",
        "Palizada", "Hopelchén",
    ],
    "Chiapas": [
        "Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula",
        "Comitán de Domínguez", "Palenque", "Ocosingo", "Tonalá",
        "Pichucalco", "Arriaga",
    ],
    "Chihuahua": [
        "Chihuahua", "Ciudad Juárez", "Cuauhtémoc", "Delicias",
        "Hidalgo del Parral", "Ojinaga", "Nuevo Casas Grandes",
        "Camargo", "Jiménez",
    ],
    "Ciudad de Mexico": [
        "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán",
        "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco",
        "Iztapalapa", "La Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta",
        "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco",
    ],
    "Coahuila": [
        "Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña",
        "Sabinas", "San Pedro de las Colonias", "Parras de la Fuente",
    ],
    "Colima": [
        "Colima", "Manzanillo", "Tecomán", "Villa de Álvarez",
        "Armería", "Cuauhtémoc", "Ixtlahuacán",
    ],
    "Durango": [
        "Durango", "Gómez Palacio", "Lerdo", "Santiago Papasquiaro",
        "El Salto", "Pueblo Nuevo", "Guadalupe Victoria",
    ],
    "Estado de Mexico": [
        "Toluca", "Ecatepec de Morelos", "Nezahualcóyotl", "Naucalpan de Juárez",
        "Tlalnepantla de Baz", "Chimalhuacán", "Metepec", "Tultitlán",
        "Texcoco", "Ixtapaluca", "Cuautitlán Izcalli", "Valle de México",
        "Huixquilucan", "Atizapán de Zaragoza", "Coacalco de Berriozábal",
    ],
    "Guanajuato": [
        "Guanajuato", "León", "Irapuato", "Celaya", "Salamanca",
        "Silao", "San Miguel de Allende", "Dolores Hidalgo",
        "Pénjamo", "Acámbaro",
    ],
    "Guerrero": [
        "Chilpancingo de los Bravo", "Acapulco de Juárez", "Zihuatanejo",
        "Iguala de la Independencia", "Taxco de Alarcón", "Teloloapan",
        "Cuetzala del Progreso",
    ],
    "Hidalgo": [
        "Pachuca de Soto", "Tulancingo", "Tizayuca", "Tula de Allende",
        "Actopan", "Ixmiquilpan", "Apan", "Huejutla de Reyes",
    ],
    "Jalisco": [
        "Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco de Zúñiga",
        "Puerto Vallarta", "Lagos de Moreno", "Tepatitlán de Morelos",
        "El Salto", "Ocotlán", "Zapotlanejo", "La Barca",
    ],
    "Michoacan": [
        "Morelia", "Lázaro Cárdenas", "Uruapan", "Zamora",
        "Apatzingán", "Zitácuaro", "Los Reyes", "Sahuayo",
        "Pátzcuaro", "Tacámbaro",
    ],
    "Morelos": [
        "Cuernavaca", "Jiutepec", "Temixco", "Cuautla",
        "Yautepec de Zaragoza", "Jojutla", "Emiliano Zapata",
    ],
    "Nayarit": [
        "Tepic", "Bahía de Banderas", "Ixtlán del Río", "Compostela",
        "Santiago Ixcuintla", "Ruiz", "Acaponeta",
    ],
    "Nuevo Leon": [
        "Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca",
        "General Escobedo", "Santa Catarina", "Juárez", "San Pedro Garza García",
        "García", "Cadereyta Jiménez", "Linares", "Montemorelos",
    ],
    "Oaxaca": [
        "Oaxaca de Juárez", "Salina Cruz", "Juchitán de Zaragoza",
        "San Juan Bautista Tuxtepec", "Loma Bonita", "Puerto Escondido",
        "Huajuapan de León", "Miahuatlán de Porfirio Díaz",
    ],
    "Puebla": [
        "Puebla de Zaragoza", "Tehuacán", "San Martín Texmelucan",
        "Atlixco", "Izúcar de Matamoros", "Amozoc", "Cuautlancingo",
        "Cholula", "Huauchinango", "Zacatlán",
    ],
    "Queretaro": [
        "Querétaro", "San Juan del Río", "El Marqués", "Corregidora",
        "El Colorado", "Cadereyta de Montes", "Jalpan de Serra",
    ],
    "Quintana Roo": [
        "Cancún", "Playa del Carmen", "Chetumal", "Cozumel",
        "Tulum", "Bacalar", "Felipe Carrillo Puerto", "Isla Mujeres",
    ],
    "San Luis Potosi": [
        "San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles",
        "Matehuala", "Rioverde", "Tamazunchale", "Cd. Fernández",
    ],
    "Sinaloa": [
        "Culiacán", "Mazatlán", "Ahome (Los Mochis)", "Guasave",
        "Guamúchil", "Navolato", "Escuinapa",
    ],
    "Sonora": [
        "Hermosillo", "Cajeme (Ciudad Obregón)", "Nogales", "San Luis Río Colorado",
        "Navojoa", "Guaymas", "Empalme", "Agua Prieta",
    ],
    "Tabasco": [
        "Villahermosa", "Cárdenas", "Comalcalco", "Macuspana",
        "Tenosique", "Balancán", "Emiliano Zapata",
    ],
    "Tamaulipas": [
        "Tampico", "Reynosa", "Matamoros", "Nuevo Laredo",
        "Ciudad Victoria", "Altamira", "Ciudad Madero", "Río Bravo",
    ],
    "Tlaxcala": [
        "Tlaxcala de Xicohténcatl", "Apizaco", "Huamantla",
        "Chiautempan", "Zacatelco", "Calpulalpan",
    ],
    "Veracruz": [
        "Xalapa-Enríquez", "Veracruz", "Coatzacoalcos", "Córdoba",
        "Orizaba", "Poza Rica de Hidalgo", "Tuxpan", "Minatitlán",
        "Boca del Río", "Papantla",
    ],
    "Yucatan": [
        "Mérida", "Kanasín", "Valladolid", "Umán",
        "Progreso", "Izamal", "Ticul", "Tekax",
    ],
    "Zacatecas": [
        "Zacatecas", "Guadalupe", "Fresnillo", "Jerez de García Salinas",
        "Calera", "Loreto", "Río Grande",
    ],
    "Remoto": ["Remoto / En línea"],
}


def get_cities(state: str) -> list[str]:
    return CITIES_BY_STATE.get(state, [])


def get_all_states() -> list[str]:
    return sorted(CITIES_BY_STATE.keys())
