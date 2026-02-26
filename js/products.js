// Mock product data
const products = [
    {
        id: 1,
        name: "Manchester United Home",
        team: "Manchester United",
        price: 1299,
        sizes: ["S", "M", "L", "XL"],
        emoji: "👕",
        description: "Oficiální domácí dres Manchester United. Vyrobeno z vysoce kvalitního polyesteru s technologií odvodu vlhkosti. Perfektní pro fanoušky i hráče.",
        longDescription: "Manchester United domácí dres je symbol jednoho z největších fotbalových klubů na světě. Dres je vybaven moderní technologií, která zajišťuje maximální pohodlí a transpiraci. Oblíbený designem na celém světě.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Atletický střih"
        }
    },
    {
        id: 2,
        name: "Liverpool Away",
        team: "Liverpool",
        price: 1299,
        sizes: ["M", "L", "XL", "XXL"],
        emoji: "👕",
        description: "Venkovní dres FC Liverpool s moderním designem. Vyroben z odolného materiálu s výbornou termoregulací.",
        longDescription: "Liverpool Away dres v klasickém šedém provedení. Vyroben z prémiového polyesteru s technologií kontroly teploty. Ideální pro horší počasí a venkovní zápasy.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "92% polyester, 8% elastan",
            care: "Prát na 30°C",
            fit: "Slim fit"
        }
    },
    {
        id: 3,
        name: "Manchester City Home",
        team: "Manchester City",
        price: 1399,
        sizes: ["XS", "S", "M", "L", "XL"],
        emoji: "👕",
        description: "Novinka letošní sezóny - Manchester City domácí dres. Elegantní modrý design s novými prvky.",
        longDescription: "Manchester City Home 2024/25 - nejnovější design s vylepšeními v technologii materiálu. Nová generace dresů s noch lepší technologií odpařování potu. Limitovaná edice.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% recycled polyester",
            care: "Prát na 40°C",
            fit: "Regular fit"
        }
    },
    {
        id: 4,
        name: "Arsenal Home",
        team: "Arsenal",
        price: 1299,
        sizes: ["M", "L", "XL"],
        emoji: "👕",
        description: "Klasický Arsenal domácí dres v ikonickém červeném designu. Kvalitní provedení pro skutečné fanoušky.",
        longDescription: "Arsenal domácí dres - jeden z nejdéle prodávaných dresů v historii klubu. Červený dres s bílými prvky, který je rozpoznatný na celém světě. Vyroben s největší péčí o kvalitu.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Atletický střih"
        }
    },
    {
        id: 5,
        name: "Chelsea Away",
        team: "Chelsea",
        price: 1299,
        sizes: ["S", "M", "L"],
        emoji: "👕",
        description: "Moderní venkovní dres Chelsea s elegantním modrým designem. Perfektní pro slunečné dny.",
        longDescription: "Chelsea Away dres v letňové barvě. Vypracovaný design s reflexními prvky pro lepší viditelnost. Ideální pro všechny ročníky.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "88% polyester, 12% elastan",
            care: "Prát na 30°C",
            fit: "Athletic fit"
        }
    },
    {
        id: 6,
        name: "Tottenham Home",
        team: "Tottenham",
        price: 1199,
        sizes: ["M", "L", "XL", "XXL"],
        emoji: "👕",
        description: "Levnější varianta Tottenham domácího dresu s kvalitou značky. Bílý dres s tmavými prvky.",
        longDescription: "Tottenham Home - přístupný dres pro všechny fandy Spurs. Tradiční bílá barva s modrými detaily. Pohodlný a trvanlivý.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Regular fit"
        }
    },
    {
        id: 7,
        name: "Barcelona Home",
        team: "Barcelona",
        price: 1499,
        sizes: ["S", "M", "L", "XL"],
        emoji: "👕",
        description: "Ikonický Barcelona domácí dres s modrožlutými pruhy. Dres jednoho z nejslavnějších klubů.",
        longDescription: "Barcelona Home - jeden z nejznámějších dresů v historii fotbalu. Klasické pruhy s zlatým potiskem klubu. Dres slavných hráčů jako Messi a Ronaldinho.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Atletický střih"
        }
    },
    {
        id: 8,
        name: "Real Madrid Home",
        team: "Real Madrid",
        price: 1499,
        sizes: ["M", "L", "XL"],
        emoji: "👕",
        description: "Real Madrid domácí dres - bílý dres nejúspěšnějšího klubu Evropy. Premium kvalita.",
        longDescription: "Real Madrid Home - symbol vítězství a tradice. Čistě bílý dres s elegantním designem. Nošen nejlepšími hráči na světě. Premium materiál s dlouhou trvanlivostí.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester premium",
            care: "Prát na 30°C",
            fit: "Slim fit"
        }
    },
    {
        id: 9,
        name: "Bayern Munich Home",
        team: "Bayern Munich",
        price: 1399,
        sizes: ["XS", "S", "M", "L", "XL"],
        emoji: "👕",
        description: "Bayern Munich domácí dres v tradiční červené barvě. Silný tým, silný dres.",
        longDescription: "Bayern Munich Home - červený dres německého fotbalového obra. Vyroben s precizností německého inženýrství. Nosí nejlepší hráči z Německa a Evropy.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Athletic fit"
        }
    },
    {
        id: 10,
        name: "PSG Home",
        team: "PSG",
        price: 1599,
        sizes: ["M", "L", "XL"],
        emoji: "👕",
        description: "Paris Saint-Germain domácí dres - premium kvalita s elegantem parážským designem.",
        longDescription: "PSG Home - dres pařížského klubu s bohatou historií. Temně modrý dres s elegantním pozlaceným logem. Nošen světovými hvězdami. Exklusivní materiál.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% premium polyester",
            care: "Prát na 30°C",
            fit: "Slim fit"
        }
    },
    {
        id: 11,
        name: "Juventus Away",
        team: "Juventus",
        price: 1299,
        sizes: ["S", "M", "L", "XL", "XXL"],
        emoji: "👕",
        description: "Juventus venkovní dres - elegantní varianta s černým designem. Italský klasik.",
        longDescription: "Juventus Away - černý dres italské fotbalové tradice. Vypracovaný design s reflexními prvky. Ideální pro venkovní zápasy a běžný nošení.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Regular fit"
        }
    },
    {
        id: 12,
        name: "Inter Milan Home",
        team: "Inter Milan",
        price: 1299,
        sizes: ["M", "L", "XL"],
        emoji: "👕",
        description: "Inter Milan domácí dres s modrožlutými pruhy. Dres druhého největšího klubu z Milána.",
        longDescription: "Inter Milan Home - ikona italského fotbalu. Charakteristické modrožluté pruhy. Vyroben s nejvyšší kvalitou. Nášivka se štítem klubu.",
        images: ["👕", "👕", "👕", "👕"],
        specs: {
            material: "100% polyester",
            care: "Prát na 30°C",
            fit: "Athletic fit"
        }
    }
];

// Get all unique teams
function getTeams() {
    return [...new Set(products.map(p => p.team))].sort();
}

// Get product by ID
function getProductById(id) {
    return products.find(p => p.id === id);
}

// Filter products
function filterProducts(searchTerm = "", team = "", size = "", maxPrice = Infinity) {
    return products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.team.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = team === "" || product.team === team;
        const matchesSize = size === "" || product.sizes.includes(size);
        const matchesPrice = product.price <= maxPrice;

        return matchesSearch && matchesTeam && matchesSize && matchesPrice;
    });
}
