export interface CurrencyDef {
  code: string;
  symbol: string;
  label: { en: string; es: string };
  aliases: string[];
}

export interface CurrencyQuery {
  mode: 'result' | 'interactive';
  from?: string;
  to?: string;
  amount?: number;
}

const ALL_CURRENCIES: CurrencyDef[] = [
  // Major global
  { code: 'USD', symbol: '$', label: { en: 'US Dollar', es: 'Dólar estadounidense' }, aliases: ['usd', 'dolar', 'dólar', 'dolares', 'dólares', 'dollar', 'dollars', '$'] },
  { code: 'EUR', symbol: '€', label: { en: 'Euro', es: 'Euro' }, aliases: ['eur', 'euro', 'euros', '€'] },
  { code: 'GBP', symbol: '£', label: { en: 'British Pound', es: 'Libra esterlina' }, aliases: ['gbp', 'libra', 'libras', 'pound', 'pounds', 'sterling', '£'] },
  { code: 'JPY', symbol: '¥', label: { en: 'Japanese Yen', es: 'Yen japonés' }, aliases: ['jpy', 'yen', 'yenes', 'yen japones', '¥'] },
  { code: 'CNY', symbol: '¥', label: { en: 'Chinese Yuan', es: 'Yuan chino' }, aliases: ['cny', 'yuan', 'yuanes', 'rmb', 'renminbi', 'yuan chino'] },
  // Latin America
  { code: 'ARS', symbol: '$', label: { en: 'Argentine Peso', es: 'Peso argentino' }, aliases: ['ars', 'peso argentino', 'pesos argentinos', 'argentine peso'] },
  { code: 'MXN', symbol: '$', label: { en: 'Mexican Peso', es: 'Peso mexicano' }, aliases: ['mxn', 'peso mexicano', 'pesos mexicanos', 'mexican peso'] },
  { code: 'BRL', symbol: 'R$', label: { en: 'Brazilian Real', es: 'Real brasileño' }, aliases: ['brl', 'real', 'reales', 'real brasileño', 'brazilian real', 'r$'] },
  { code: 'CLP', symbol: '$', label: { en: 'Chilean Peso', es: 'Peso chileno' }, aliases: ['clp', 'peso chileno', 'pesos chilenos', 'chilean peso'] },
  { code: 'COP', symbol: '$', label: { en: 'Colombian Peso', es: 'Peso colombiano' }, aliases: ['cop', 'peso colombiano', 'pesos colombianos', 'colombian peso'] },
  { code: 'PEN', symbol: 'S/', label: { en: 'Peruvian Sol', es: 'Sol peruano' }, aliases: ['pen', 'sol', 'soles', 'sol peruano', 'peruvian sol', 's/'] },
  { code: 'UYU', symbol: '$U', label: { en: 'Uruguayan Peso', es: 'Peso uruguayo' }, aliases: ['uyu', 'peso uruguayo', 'pesos uruguayos', 'uruguayan peso'] },
  { code: 'BOB', symbol: 'Bs', label: { en: 'Bolivian Boliviano', es: 'Boliviano' }, aliases: ['bob', 'boliviano', 'bolivianos', 'bolivian boliviano'] },
  { code: 'PYG', symbol: '₲', label: { en: 'Paraguayan Guarani', es: 'Guaraní paraguayo' }, aliases: ['pyg', 'guarani', 'guaraní', 'paraguayan guarani'] },
  { code: 'VES', symbol: 'Bs.S', label: { en: 'Venezuelan Bolivar', es: 'Bolívar venezolano' }, aliases: ['ves', 'bolivar', 'bolívar', 'venezuelan bolivar', 'bolivar soberano'] },
  // North America / Oceania
  { code: 'CAD', symbol: 'C$', label: { en: 'Canadian Dollar', es: 'Dólar canadiense' }, aliases: ['cad', 'dolar canadiense', 'dólar canadiense', 'canadian dollar'] },
  { code: 'AUD', symbol: 'A$', label: { en: 'Australian Dollar', es: 'Dólar australiano' }, aliases: ['aud', 'dolar australiano', 'dólar australiano', 'australian dollar'] },
  { code: 'NZD', symbol: 'NZ$', label: { en: 'New Zealand Dollar', es: 'Dólar neozelandés' }, aliases: ['nzd', 'dolar neozelandes', 'dólar neozelandés', 'new zealand dollar'] },
  // Europe
  { code: 'CHF', symbol: 'Fr', label: { en: 'Swiss Franc', es: 'Franco suizo' }, aliases: ['chf', 'franco', 'francos', 'franco suizo', 'swiss franc'] },
  { code: 'SEK', symbol: 'kr', label: { en: 'Swedish Krona', es: 'Corona sueca' }, aliases: ['sek', 'corona', 'coronas', 'corona sueca', 'swedish krona'] },
  { code: 'NOK', symbol: 'kr', label: { en: 'Norwegian Krone', es: 'Corona noruega' }, aliases: ['nok', 'corona noruega', 'norwegian krone'] },
  { code: 'DKK', symbol: 'kr', label: { en: 'Danish Krone', es: 'Corona danesa' }, aliases: ['dkk', 'corona danesa', 'danish krone'] },
  { code: 'PLN', symbol: 'zł', label: { en: 'Polish Zloty', es: 'Zloty polaco' }, aliases: ['pln', 'zloty', 'zloty polaco', 'polish zloty', 'zł'] },
  { code: 'CZK', symbol: 'Kč', label: { en: 'Czech Koruna', es: 'Corona checa' }, aliases: ['czk', 'koruna', 'corona checa', 'czech koruna'] },
  { code: 'HUF', symbol: 'Ft', label: { en: 'Hungarian Forint', es: 'Florín húngaro' }, aliases: ['huf', 'forint', 'florin', 'florín', 'hungarian forint'] },
  { code: 'RON', symbol: 'lei', label: { en: 'Romanian Leu', es: 'Leu rumano' }, aliases: ['ron', 'leu', 'leu rumano', 'romanian leu'] },
  { code: 'BGN', symbol: 'лв', label: { en: 'Bulgarian Lev', es: 'Lev búlgaro' }, aliases: ['bgn', 'lev', 'lev bulgaro', 'bulgarian lev'] },
  { code: 'HRK', symbol: 'kn', label: { en: 'Croatian Kuna', es: 'Kuna croata' }, aliases: ['hrk', 'kuna', 'kuna croata', 'croatian kuna'] },
  { code: 'ISK', symbol: 'kr', label: { en: 'Icelandic Krona', es: 'Corona islandesa' }, aliases: ['isk', 'corona islandesa', 'icelandic krona'] },
  { code: 'RUB', symbol: '₽', label: { en: 'Russian Ruble', es: 'Rublo ruso' }, aliases: ['rub', 'rublo', 'rublos', 'rublo ruso', 'russian ruble', '₽'] },
  { code: 'TRY', symbol: '₺', label: { en: 'Turkish Lira', es: 'Lira turca' }, aliases: ['try', 'lira', 'liras', 'lira turca', 'turkish lira', '₺'] },
  { code: 'UAH', symbol: '₴', label: { en: 'Ukrainian Hryvnia', es: 'Grivna ucraniana' }, aliases: ['uah', 'hryvnia', 'grivna', 'grivna ucraniana', 'ukrainian hryvnia'] },
  { code: 'GEL', symbol: '₾', label: { en: 'Georgian Lari', es: 'Lari georgiano' }, aliases: ['gel', 'lari', 'lari georgiano', 'georgian lari'] },
  { code: 'MDL', symbol: 'L', label: { en: 'Moldovan Leu', es: 'Leu moldavo' }, aliases: ['mdl', 'leu moldavo', 'moldovan leu'] },
  { code: 'ALL', symbol: 'L', label: { en: 'Albanian Lek', es: 'Lek albanés' }, aliases: ['all', 'lek', 'lek albanes', 'albanian lek'] },
  { code: 'BAM', symbol: 'KM', label: { en: 'Bosnia Mark', es: 'Marco bosnio' }, aliases: ['bam', 'mark', 'marco', 'marco bosnio', 'bosnia mark'] },
  { code: 'MKD', symbol: 'ден', label: { en: 'Macedonian Denar', es: 'Dinar macedonio' }, aliases: ['mkd', 'denar', 'dinar', 'dinar macedonio', 'macedonian denar'] },
  { code: 'RSD', symbol: 'din', label: { en: 'Serbian Dinar', es: 'Dinar serbio' }, aliases: ['rsd', 'dinar serbio', 'serbian dinar'] },
  // Asia
  { code: 'KRW', symbol: '₩', label: { en: 'South Korean Won', es: 'Won surcoreano' }, aliases: ['krw', 'won', 'won surcoreano', 'south korean won', '₩'] },
  { code: 'INR', symbol: '₹', label: { en: 'Indian Rupee', es: 'Rupia india' }, aliases: ['inr', 'rupia', 'rupias', 'rupia india', 'indian rupee', '₹'] },
  { code: 'IDR', symbol: 'Rp', label: { en: 'Indonesian Rupiah', es: 'Rupia indonesia' }, aliases: ['idr', 'rupia indonesia', 'indonesian rupiah'] },
  { code: 'PHP', symbol: '₱', label: { en: 'Philippine Peso', es: 'Peso filipino' }, aliases: ['php', 'peso filipino', 'philippine peso'] },
  { code: 'THB', symbol: '฿', label: { en: 'Thai Baht', es: 'Baht tailandés' }, aliases: ['thb', 'baht', 'baht tailandes', 'thai baht'] },
  { code: 'MYR', symbol: 'RM', label: { en: 'Malaysian Ringgit', es: 'Ringgit malayo' }, aliases: ['myr', 'ringgit', 'ringgit malayo', 'malaysian ringgit'] },
  { code: 'VND', symbol: '₫', label: { en: 'Vietnamese Dong', es: 'Dong vietnamita' }, aliases: ['vnd', 'dong', 'dong vietnamita', 'vietnamese dong'] },
  { code: 'SGD', symbol: 'S$', label: { en: 'Singapore Dollar', es: 'Dólar singapurense' }, aliases: ['sgd', 'dolar singapurense', 'dólar singapurense', 'singapore dollar'] },
  { code: 'HKD', symbol: 'HK$', label: { en: 'Hong Kong Dollar', es: 'Dólar hongkonés' }, aliases: ['hkd', 'dolar hongkones', 'dólar hongkonés', 'hong kong dollar'] },
  { code: 'TWD', symbol: 'NT$', label: { en: 'Taiwan Dollar', es: 'Dólar taiwanés' }, aliases: ['twd', 'dolar taiwanes', 'dólar taiwanés', 'taiwan dollar'] },
  { code: 'PKR', symbol: '₨', label: { en: 'Pakistani Rupee', es: 'Rupia pakistaní' }, aliases: ['pkr', 'rupia pakistani', 'pakistani rupee'] },
  { code: 'BDT', symbol: '৳', label: { en: 'Bangladeshi Taka', es: 'Taka bangladesí' }, aliases: ['bdt', 'taka', 'taka bangladesi', 'bangladeshi taka'] },
  { code: 'LKR', symbol: 'Rs', label: { en: 'Sri Lankan Rupee', es: 'Rupia de Sri Lanka' }, aliases: ['lkr', 'rupia sri lanka', 'sri lankan rupee'] },
  { code: 'MMK', symbol: 'K', label: { en: 'Myanmar Kyat', es: 'Kyat birmano' }, aliases: ['mmk', 'kyat', 'kyat birmano', 'myanmar kyat'] },
  { code: 'KHR', symbol: '៛', label: { en: 'Cambodian Riel', es: 'Riel camboyano' }, aliases: ['khr', 'riel', 'riel camboyano', 'cambodian riel'] },
  { code: 'LAK', symbol: '₭', label: { en: 'Lao Kip', es: 'Kip laosiano' }, aliases: ['lak', 'kip', 'kip laosiano', 'lao kip'] },
  { code: 'MNT', symbol: '₮', label: { en: 'Mongolian Tugrik', es: 'Tugrik mongol' }, aliases: ['mnt', 'tugrik', 'tugrik mongol', 'mongolian tugrik'] },
  { code: 'NPR', symbol: 'Rs', label: { en: 'Nepalese Rupee', es: 'Rupia nepalesa' }, aliases: ['npr', 'rupia nepalesa', 'nepalese rupee'] },
  { code: 'KZT', symbol: '₸', label: { en: 'Kazakhstani Tenge', es: 'Tenge kazajo' }, aliases: ['kzt', 'tenge', 'tenge kazajo', 'kazakhstani tenge'] },
  { code: 'UZS', symbol: 'soʻm', label: { en: 'Uzbekistani Som', es: 'Som uzbeko' }, aliases: ['uzs', 'som', 'som uzbeko', 'uzbekistani som'] },
  { code: 'KGS', symbol: 'с', label: { en: 'Kyrgystani Som', es: 'Som kirguís' }, aliases: ['kgs', 'som kirguis', 'som kirguís', 'kyrgystani som'] },
  { code: 'TJS', symbol: 'SM', label: { en: 'Tajikistani Somoni', es: 'Somoni tayiko' }, aliases: ['tjs', 'somoni', 'somoni tayiko', 'tajikistani somoni'] },
  { code: 'AFN', symbol: '؋', label: { en: 'Afghan Afghani', es: 'Afgani afgano' }, aliases: ['afn', 'afghani', 'afgani afgano', 'afghan afghani'] },
  { code: 'IRR', symbol: '﷼', label: { en: 'Iranian Rial', es: 'Rial iraní' }, aliases: ['irr', 'rial', 'rial irani', 'iranian rial'] },
  { code: 'IQD', symbol: 'ع.د', label: { en: 'Iraqi Dinar', es: 'Dinar iraquí' }, aliases: ['iqd', 'dinar iraqui', 'dinar iraquí', 'iraqi dinar'] },
  { code: 'SYP', symbol: '£S', label: { en: 'Syrian Pound', es: 'Libra siria' }, aliases: ['syp', 'libra siria', 'syrian pound'] },
  { code: 'JOD', symbol: 'JD', label: { en: 'Jordanian Dinar', es: 'Dinar jordano' }, aliases: ['jod', 'dinar jordano', 'jordanian dinar'] },
  { code: 'LBP', symbol: 'ل.ل', label: { en: 'Lebanese Pound', es: 'Libra libanesa' }, aliases: ['lbp', 'libra libanesa', 'lebanese pound'] },
  { code: 'OMR', symbol: '﷼', label: { en: 'Omani Rial', es: 'Rial omaní' }, aliases: ['omr', 'rial omani', 'rial omaní', 'omani rial'] },
  { code: 'QAR', symbol: '﷼', label: { en: 'Qatari Riyal', es: 'Riyal qatarí' }, aliases: ['qar', 'riyal', 'riyal qatari', 'riyal qatarí', 'qatari riyal'] },
  { code: 'SAR', symbol: '﷼', label: { en: 'Saudi Riyal', es: 'Riyal saudí' }, aliases: ['sar', 'riyal saudi', 'riyal saudí', 'saudi riyal'] },
  { code: 'AED', symbol: 'د.إ', label: { en: 'UAE Dirham', es: 'Dírham emiratí' }, aliases: ['aed', 'dirham', 'dirham emirati', 'dírham emiratí', 'uae dirham'] },
  { code: 'KWD', symbol: 'د.ك', label: { en: 'Kuwaiti Dinar', es: 'Dinar kuwaití' }, aliases: ['kwd', 'dinar kuwaiti', 'dinar kuwaití', 'kuwaiti dinar'] },
  { code: 'BHD', symbol: '.د.ب', label: { en: 'Bahraini Dinar', es: 'Dinar bahreiní' }, aliases: ['bhd', 'dinar bahreini', 'dinar bahreiní', 'bahraini dinar'] },
  { code: 'YER', symbol: '﷼', label: { en: 'Yemeni Rial', es: 'Rial yemení' }, aliases: ['yer', 'rial yemeni', 'rial yemení', 'yemeni rial'] },
  // Africa
  { code: 'ZAR', symbol: 'R', label: { en: 'South African Rand', es: 'Rand sudafricano' }, aliases: ['zar', 'rand', 'rand sudafricano', 'south african rand'] },
  { code: 'EGP', symbol: '£', label: { en: 'Egyptian Pound', es: 'Libra egipcia' }, aliases: ['egp', 'libra egipcia', 'egyptian pound'] },
  { code: 'NGN', symbol: '₦', label: { en: 'Nigerian Naira', es: 'Naira nigeriana' }, aliases: ['ngn', 'naira', 'naira nigeriana', 'nigerian naira'] },
  { code: 'KES', symbol: 'KSh', label: { en: 'Kenyan Shilling', es: 'Chelín keniano' }, aliases: ['kes', 'shilling', 'chelin', 'chelín', 'chelin keniano', 'kenyan shilling'] },
  { code: 'GHS', symbol: '₵', label: { en: 'Ghanaian Cedi', es: 'Cedi ghanés' }, aliases: ['ghs', 'cedi', 'cedi ghanes', 'cedi ghanés', 'ghanaian cedi'] },
  { code: 'MAD', symbol: 'د.م.', label: { en: 'Moroccan Dirham', es: 'Dírham marroquí' }, aliases: ['mad', 'dirham marroqui', 'dírham marroquí', 'moroccan dirham'] },
  { code: 'TND', symbol: 'د.ت', label: { en: 'Tunisian Dinar', es: 'Dinar tunecino' }, aliases: ['tnd', 'dinar tunecino', 'tunisian dinar'] },
  { code: 'DZD', symbol: 'د.ج', label: { en: 'Algerian Dinar', es: 'Dinar argelino' }, aliases: ['dzd', 'dinar argelino', 'algerian dinar'] },
  { code: 'LYD', symbol: 'ل.د', label: { en: 'Libyan Dinar', es: 'Dinar libio' }, aliases: ['lyd', 'dinar libio', 'libyan dinar'] },
  { code: 'SDG', symbol: 'ج.س.', label: { en: 'Sudanese Pound', es: 'Libra sudanesa' }, aliases: ['sdg', 'libra sudanesa', 'sudanese pound'] },
  { code: 'ETB', symbol: 'Br', label: { en: 'Ethiopian Birr', es: 'Birr etíope' }, aliases: ['etb', 'birr', 'birr etiope', 'birr etíope', 'ethiopian birr'] },
  { code: 'TZS', symbol: 'Sh', label: { en: 'Tanzanian Shilling', es: 'Chelín tanzano' }, aliases: ['tzs', 'chelin tanzano', 'chelín tanzano', 'tanzanian shilling'] },
  { code: 'UGX', symbol: 'Sh', label: { en: 'Ugandan Shilling', es: 'Chelín ugandés' }, aliases: ['ugx', 'chelin ugandes', 'chelín ugandés', 'ugandan shilling'] },
  { code: 'RWF', symbol: 'Fr', label: { en: 'Rwandan Franc', es: 'Franco ruandés' }, aliases: ['rwf', 'franco ruandes', 'franco ruandés', 'rwandan franc'] },
  { code: 'ZMW', symbol: 'K', label: { en: 'Zambian Kwacha', es: 'Kwacha zambiano' }, aliases: ['zmw', 'kwacha', 'kwacha zambiano', 'zambian kwacha'] },
  { code: 'MWK', symbol: 'MK', label: { en: 'Malawian Kwacha', es: 'Kwacha malauí' }, aliases: ['mwk', 'kwacha malaui', 'kwacha malauí', 'malawian kwacha'] },
  { code: 'BWP', symbol: 'P', label: { en: 'Botswana Pula', es: 'Pula botsuano' }, aliases: ['bwp', 'pula', 'pula botsuano', 'botswana pula'] },
  { code: 'NAD', symbol: 'N$', label: { en: 'Namibian Dollar', es: 'Dólar namibio' }, aliases: ['nad', 'dolar namibio', 'dólar namibio', 'namibian dollar'] },
  { code: 'SZL', symbol: 'E', label: { en: 'Swazi Lilangeni', es: 'Lilangeni suazi' }, aliases: ['szl', 'lilangeni', 'lilangeni suazi', 'swazi lilangeni'] },
  { code: 'LSL', symbol: 'L', label: { en: 'Lesotho Loti', es: 'Loti lesotense' }, aliases: ['lsl', 'loti', 'loti lesotense', 'lesotho loti'] },
  { code: 'MUR', symbol: '₨', label: { en: 'Mauritian Rupee', es: 'Rupia mauriciana' }, aliases: ['mur', 'rupia mauriciana', 'mauritian rupee'] },
  { code: 'SCR', symbol: '₨', label: { en: 'Seychellois Rupee', es: 'Rupia seychellense' }, aliases: ['scr', 'rupia seychellense', 'seychellois rupee'] },
  { code: 'AOA', symbol: 'Kz', label: { en: 'Angolan Kwanza', es: 'Kwanza angoleño' }, aliases: ['aoa', 'kwanza', 'kwanza angoleño', 'angolan kwanza'] },
  { code: 'CDF', symbol: 'FC', label: { en: 'Congolese Franc', es: 'Franco congoleño' }, aliases: ['cdf', 'franco congoleno', 'franco congoleño', 'congolese franc'] },
  { code: 'XAF', symbol: 'Fr', label: { en: 'CFA Franc BEAC', es: 'Franco CFA BEAC' }, aliases: ['xaf', 'franco cfa', 'cfa franc', 'cfa franc beac'] },
  { code: 'XOF', symbol: 'Fr', label: { en: 'CFA Franc BCEAO', es: 'Franco CFA BCEAO' }, aliases: ['xof', 'franco cfa bceao', 'cfa franc bceao'] },
  // Middle East / Central Asia continued
  { code: 'BYN', symbol: 'Br', label: { en: 'Belarusian Ruble', es: 'Rublo bielorruso' }, aliases: ['byn', 'rublo bielorruso', 'belarusian ruble'] },
  { code: 'AMD', symbol: '֏', label: { en: 'Armenian Dram', es: 'Dram armenio' }, aliases: ['amd', 'dram', 'dram armenio', 'armenian dram'] },
  { code: 'AZN', symbol: '₼', label: { en: 'Azerbaijani Manat', es: 'Manat azerbaiyano' }, aliases: ['azn', 'manat', 'manat azerbaiyano', 'azerbaijani manat'] },
  // Caribbean / Pacific
  { code: 'XCD', symbol: '$', label: { en: 'East Caribbean Dollar', es: 'Dólar del Caribe Oriental' }, aliases: ['xcd', 'dolar caribe oriental', 'dólar del caribe oriental', 'east caribbean dollar'] },
  { code: 'BBD', symbol: '$', label: { en: 'Barbados Dollar', es: 'Dólar de Barbados' }, aliases: ['bbd', 'dolar barbados', 'dólar de barbados', 'barbados dollar'] },
  { code: 'TTD', symbol: '$', label: { en: 'Trinidad Dollar', es: 'Dólar de Trinidad' }, aliases: ['ttd', 'dolar trinidad', 'dólar de trinidad', 'trinidad dollar'] },
  { code: 'JMD', symbol: '$', label: { en: 'Jamaican Dollar', es: 'Dólar jamaiquino' }, aliases: ['jmd', 'dolar jamaicano', 'dólar jamaiquino', 'jamaican dollar'] },
  { code: 'BSD', symbol: '$', label: { en: 'Bahamian Dollar', es: 'Dólar bahameño' }, aliases: ['bsd', 'dolar bahameno', 'dólar bahameño', 'bahamian dollar'] },
  { code: 'BZD', symbol: '$', label: { en: 'Belize Dollar', es: 'Dólar beliceño' }, aliases: ['bzd', 'dolar beliceno', 'dólar beliceño', 'belize dollar'] },
  { code: 'GYD', symbol: '$', label: { en: 'Guyana Dollar', es: 'Dólar guyanés' }, aliases: ['gyd', 'dolar guyanes', 'dólar guyanés', 'guyana dollar'] },
  { code: 'SRD', symbol: '$', label: { en: 'Surinam Dollar', es: 'Dólar surinamés' }, aliases: ['srd', 'dolar surinames', 'dólar surinamés', 'surinam dollar'] },
  { code: 'HTG', symbol: 'G', label: { en: 'Haitian Gourde', es: 'Gourde haitiano' }, aliases: ['htg', 'gourde', 'gourde haitiano', 'haitian gourde'] },
  { code: 'FJD', symbol: '$', label: { en: 'Fiji Dollar', es: 'Dólar fiyiano' }, aliases: ['fjd', 'dolar fiyiano', 'dólar fiyiano', 'fiji dollar'] },
  { code: 'PGK', symbol: 'K', label: { en: 'Papua Kina', es: 'Kina de Papúa' }, aliases: ['pgk', 'kina', 'kina de papua', 'papua kina'] },
  { code: 'WST', symbol: 'T', label: { en: 'Samoan Tala', es: 'Tala samoano' }, aliases: ['wst', 'tala', 'tala samoano', 'samoan tala'] },
  { code: 'TOP', symbol: 'T$', label: { en: 'Tongan Paʻanga', es: 'Paʻanga tongano' }, aliases: ['top', 'paanga', 'paʻanga', 'tongan paanga'] },
  { code: 'VUV', symbol: 'Vt', label: { en: 'Vanuatu Vatu', es: 'Vatu vanuatuense' }, aliases: ['vuv', 'vatu', 'vatu vanuatuense', 'vanuatu vatu'] },
  // Other
  { code: 'ILS', symbol: '₪', label: { en: 'Israeli Shekel', es: 'Shekel israelí' }, aliases: ['ils', 'shekel', 'shekel israeli', 'shekel israelí', 'israeli shekel'] },
];

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildCurrencyAliasMap(): Map<string, CurrencyDef> {
  const map = new Map<string, CurrencyDef>();
  for (const c of ALL_CURRENCIES) {
    for (const alias of c.aliases) {
      const key = alias.toLowerCase();
      if (!map.has(key)) map.set(key, c);
      const stripped = stripDiacritics(key);
      if (stripped !== key && !map.has(stripped)) map.set(stripped, c);
    }
  }
  return map;
}

const currencyAliasMap = buildCurrencyAliasMap();

const CURRENCY_KEYWORDS = /^(convertir|conversion|conversión|cambio|cambiar|exchange|currency|divisa|moneda)$/i;
const CONNECTORS = /^(a|en|to|in|into|de|por|for|and|y|o|vs|per)$/i;

export function detectCurrencyQuery(query: string): CurrencyQuery | null {
  const lower = query.toLowerCase().trim();
  const rawTokens = lower.split(/[\s,;:.!?¡¿()\[\]{}"']+/).filter(t => t.length > 0);
  if (rawTokens.length === 0) return null;

  let amount: number | undefined;
  const tokens: string[] = [];
  let hasKeyword = false;

  for (const token of rawTokens) {
    const num = parseFloat(token.replace(',', '.'));
    if (!isNaN(num) && token !== '') {
      if (amount === undefined) amount = num;
      continue;
    }
    if (CURRENCY_KEYWORDS.test(stripDiacritics(token))) {
      hasKeyword = true;
      continue;
    }
    if (CONNECTORS.test(token)) continue;
    tokens.push(token);
  }

  const consumed = new Set<number>();
  const found: { currency: CurrencyDef; firstIndex: number }[] = [];

  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      if (consumed.has(i)) continue;
      let skip = false;
      for (let k = 0; k < n; k++) { if (consumed.has(i + k)) { skip = true; break; } }
      if (skip) continue;

      const ngram = tokens.slice(i, i + n).join(' ');
      const match = currencyAliasMap.get(stripDiacritics(ngram));
      if (match && !found.some(f => f.currency.code === match.code)) {
        found.push({ currency: match, firstIndex: i });
        for (let k = 0; k < n; k++) consumed.add(i + k);
      }
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (consumed.has(i)) continue;
    const m = currencyAliasMap.get(stripDiacritics(tokens[i]));
    if (m && !found.some(f => f.currency.code === m.code)) {
      found.push({ currency: m, firstIndex: i });
      consumed.add(i);
    }
  }

  found.sort((a, b) => a.firstIndex - b.firstIndex);

  const currencies = found.map(f => f.currency);

  if (currencies.length >= 2) {
    return {
      mode: amount != null ? 'result' : 'interactive',
      from: currencies[0].code,
      to: currencies[1].code,
      amount: amount ?? 1,
    };
  }

  if (hasKeyword && currencies.length === 1) {
    const other = ALL_CURRENCIES.find(c => c.code !== currencies[0].code);
    return {
      mode: 'interactive',
      from: currencies[0].code,
      to: other ? other.code : 'USD',
      amount: amount ?? 1,
    };
  }

  return null;
}

export function getClientCurrencies(lang: string = 'en') {
  const key = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  return ALL_CURRENCIES.map(c => ({
    code: c.code,
    symbol: c.symbol,
    label: c.label[key],
  }));
}

export function getCurrencyByCode(code: string): CurrencyDef | undefined {
  return ALL_CURRENCIES.find(c => c.code === code.toUpperCase());
}
