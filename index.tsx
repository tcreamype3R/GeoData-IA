/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';

declare const google: any;

async function runApplication() {
  // --- Type Definitions ---
  type Language = 'es' | 'en';

  interface Insight {
    title: string;
    statistic: string;
    description: string;
    category: string;
  }
  interface Weather {
      temperature: string;
      condition: string;
      icon: string;
  }
  interface AppData {
      insights: Insight[];
      newsletterHtml: string;
      weather: Weather;
  }

function loadGoogleMapsScript() {
    if (document.getElementById('google-maps-script')) return;
    
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key not configured. Map functionality is disabled.");
        if (mapElement) {
          (mapElement as HTMLElement).style.display = 'none';
        }
        return;
    }

    // Resto del código...
}
  // --- DOM Elements ---
  const insightsForm = document.querySelector('#insights-form') as HTMLFormElement;
  const locationInput = document.querySelector('#location') as HTMLInputElement;
  const generateButton = document.querySelector('#generate-button') as HTMLButtonElement;
  const insightsTitle = document.querySelector('#insights-title') as HTMLElement;
  const insightsGrid = document.querySelector('#insights-grid') as HTMLElement;
  const newsletterContent = document.querySelector('#newsletter-content') as HTMLDivElement;
  const copyButton = document.querySelector('#copy-button') as HTMLButtonElement;
  const exportHtmlButton = document.querySelector('#export-html-button') as HTMLButtonElement;
  const shareLinkedinButton = document.querySelector('#share-linkedin-button') as HTMLButtonElement;
  const locationInfoEl = document.querySelector('#location-info') as HTMLDivElement;
  const weatherInfoEl = document.querySelector('#weather-info') as HTMLDivElement;
  const langSwitchers = document.querySelectorAll('.lang-option');
  const viewNewsletterButton = document.querySelector('#view-newsletter-button') as HTMLButtonElement;
  const newsletterModal = document.querySelector('#newsletter-modal') as HTMLDivElement;
  const modalCloseButton = document.querySelector('.modal-close-button') as HTMLButtonElement;
  const mapElement = document.querySelector('#map') as HTMLDivElement;
  
  // --- Translations ---
  const translations = {
    es: {
      headerTitle: "Geo-Data Insights Newsletter",
      headerSubtitle: "Recibe análisis geoespaciales personalizados basados en tu ubicación",
      generateTitle: "Generar Insights por Ubicación",
      locationLabel: "Ubicación",
      mapPlaceholder: "Buscar una ubicación...",
      generateButton: "Generar Insights",
      generatingButton: "Generando...",
      insightsTitle: "Últimos Insights para {location}",
      newsletterTitle: "Boletín de Insights",
      newsletterPlaceholder: "Genere insights para crear el boletín.",
      copyButton: "Copiar Texto",
      exportButton: "Exportar como HTML",
      shareButton: "Compartir en LinkedIn",
      subscribeButton: "Suscríbete al \"Reto 100% Data Science\"",
      copyright: "© Proyecto GoalTracker by TCreaMYPE",
      noInsights: "No se encontraron insights para esta ubicación.",
      generatingNewsletter: "Generando nuevo boletín...",
      promptInstruction: `Eres un analista de datos experto y periodista cultural para:`,
      promptDetails: `Genera un informe JSON en español que incluya 'weather', 4-6 'insights' y un 'newsletterHtml'. Enfócate en el patrimonio cultural local (ej. Festejo y Décimas para Chincha), comercio, servicios y seguridad. El HTML debe usar h3, ul, li, strong y finalizar con hashtags relevantes.`,
      apiError: "<strong>Error al generar insights:</strong><br>{error}<br><br>Por favor, revisa que tu clave API de Gemini sea correcta y esté activa.",
      copied: "Copiado!",
      copyError: "Error al copiar el texto.",
      exportTitle: "Boletín de Geo-Data Insights",
      exportSubscribe: "Suscríbete",
      viewNewsletterButton: "Ver Boletín",
    },
    en: {
      headerTitle: "Geo-Data Insights Newsletter",
      headerSubtitle: "Get personalized geospatial analysis based on your location",
      generateTitle: "Generate Insights by Location",
      locationLabel: "Location",
      mapPlaceholder: "Search for a location...",
      generateButton: "Generate Insights",
      generatingButton: "Generating...",
      insightsTitle: "Latest Insights for {location}",
      newsletterTitle: "Insights Newsletter",
      newsletterPlaceholder: "Generate insights to create the newsletter.",
      copyButton: "Copy Text",
      exportButton: "Export as HTML",
      shareButton: "Share on LinkedIn",
      subscribeButton: "Subscribe to \"100% Data Science Challenge\"",
      copyright: "© GoalTracker Project by TCreaMYPE",
      noInsights: "No insights found for this location.",
      generatingNewsletter: "Generating new newsletter...",
      promptInstruction: `You are an expert data analyst and cultural journalist for:`,
      promptDetails: `Generate a JSON report in English that includes 'weather', 4-6 'insights', and 'newsletterHtml'. Focus on local cultural heritage (e.g., Festejo and Décimas for Chincha), commerce, services, and security. The HTML must use h3, ul, li, strong, and end with relevant hashtags.`,
      apiError: "<strong>Error generating insights:</strong><br>{error}<br><br>Please check that your Gemini API key is correct and active.",
      copied: "Copied!",
      copyError: "Error copying text.",
      exportTitle: "Geo-Data Insights Newsletter",
      exportSubscribe: "Subscribe",
      viewNewsletterButton: "View Newsletter",
    }
  };
  
  // --- State ---
  let latestData: AppData | null = null;
  let currentLanguage: Language = 'es';
  let currentLocation: string = 'Chincha Alta, Perú';
  let map: any = null;
  let marker: any = null;
  let geocoder: any = null;

  const initialData: { [key in Language]: AppData } = {
    es: {
      insights: [
        { title: 'Cuna del Festejo', statistic: 'Patrimonio Vivo', description: 'El baile y las décimas son el corazón cultural de la ciudad.', category: 'culture' },
        { title: 'Hacienda San José', statistic: 'Historia Afroperuana', description: 'Un viaje al pasado colonial y la rica herencia de la región.', category: 'culture' },
        { title: 'Mercado de Abastos', statistic: 'Sabores Locales', description: 'Centro neurálgico del comercio y la gastronomía chinchana.', category: 'commerce' },
        { title: 'Hospital San José', statistic: 'Atención Primaria', description: 'Principal centro de salud para emergencias en la provincia.', category: 'health' },
      ],
      newsletterHtml: `<h3>Boletín para Chincha Alta, Perú</h3><p>Aquí tienes un resumen del patrimonio cultural y los puntos de interés de Chincha:</p><ul><li><strong>Agenda de Cultura Viva:</strong> Chincha es la cuna del Festejo y las Décimas, expresiones artísticas que celebran la herencia afroperuana y que se viven en sus peñas y festivales.</li><li><strong>Patrimonio Histórico:</strong> La Hacienda San José ofrece una mirada profunda a la historia colonial y la resiliencia de la comunidad afrodescendiente.</li><li><strong>Comercio Local:</strong> El Mercado de Abastos es el lugar ideal para descubrir los productos frescos y la sazón única de la gastronomía chinchana.</li><li><strong>Servicios Esenciales:</strong> El Hospital San José es el principal punto de referencia para la atención médica en la ciudad.</li></ul><p><strong>#Chincha #CulturaAfroperuana #Festejo #Peru #PatrimonioCultural</strong></p>`,
      weather: { temperature: '21°C', condition: 'Parcialmente Nublado', icon: 'cloud-sun' },
    },
    en: {
        insights: [
            { title: 'Cradle of Festejo', statistic: 'Living Heritage', description: 'The dance and "décimas" are the cultural heart of the city.', category: 'culture' },
            { title: 'Hacienda San José', statistic: 'Afro-Peruvian History', description: 'A journey into the colonial past and the rich heritage of the region.', category: 'culture' },
            { title: 'Main Market', statistic: 'Local Flavors', description: 'The nerve center of Chincha\'s commerce and gastronomy.', category: 'commerce' },
            { title: 'San José Hospital', statistic: 'Primary Care', description: 'Main health center for emergencies in the province.', category: 'health' },
        ],
        newsletterHtml: `<h3>Newsletter for Chincha Alta, Peru</h3><p>Here is a summary of the cultural heritage and points of interest in Chincha:</p><ul><li><strong>Living Culture Agenda:</strong> Chincha is the cradle of Festejo and Décimas, artistic expressions that celebrate Afro-Peruvian heritage and are experienced in its "peñas" and festivals.</li><li><strong>Historical Heritage:</strong> Hacienda San José offers a deep look into colonial history and the resilience of the Afro-descendant community.</li><li><strong>Local Commerce:</strong> The Main Market is the ideal place to discover fresh products and the unique seasoning of Chincha's gastronomy.</li><li><strong>Essential Services:</strong> The San José Hospital is the main reference point for medical care in the city.</li></ul><p><strong>#Chincha #AfroPeruvianCulture #Festejo #Peru #CulturalHeritage</strong></p>`,
        weather: { temperature: '70°F', condition: 'Partly Cloudy', icon: 'cloud-sun' },
    }
  };

  // --- Gemini AI Initialization ---
  const ai = new GoogleGenAI({ apiKey: (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined });

  // --- Functions ---

  function openModal() {
    if (!latestData) return;
    newsletterContent.innerHTML = latestData.newsletterHtml;
    newsletterModal.classList.add('visible');
    newsletterModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    newsletterModal.classList.remove('visible');
    newsletterModal.setAttribute('aria-hidden', 'true');
  }
  
  function setLanguage(lang: Language) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key') as keyof typeof translations.es;
        if (key && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    locationInput.placeholder = translations[lang].mapPlaceholder;

    langSwitchers.forEach(switcher => {
      switcher.classList.toggle('active', switcher.getAttribute('data-lang') === lang);
    });
    
    if (!latestData || locationInput.value === 'Chincha Alta, Perú') {
       latestData = initialData[currentLanguage];
    }
    
    if(latestData){
        updateUI(latestData, currentLocation);
    }
  }

  // --- Map Functions ---
  const darkMapStyle = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];

  function updateLocationOnMap(newLocation: { lat: number, lng: number }, updateInputText: boolean = true) {
      if (!geocoder || !marker || !map) return;
      
      const latLng = new google.maps.LatLng(newLocation.lat, newLocation.lng);
      marker.setPosition(latLng);
      map.panTo(latLng);

      if (updateInputText) {
          geocoder.geocode({ 'location': latLng }, (results: any[], status: string) => {
              if (status === 'OK' && results[0]) {
                  const newLocationName = results[0].formatted_address;
                  locationInput.value = newLocationName;
                  currentLocation = newLocationName;
              } else {
                  console.warn('Geocoder failed due to: ' + status);
                  const fallbackName = `${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}`;
                  locationInput.value = fallbackName;
                  currentLocation = fallbackName;
              }
          });
      }
  }

  function initMap() {
    const initialPosition = { lat: -13.458, lng: -76.132 }; // Chincha Alta
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(mapElement, {
        center: initialPosition,
        zoom: 13,
        styles: darkMapStyle,
        mapTypeControl: false,
        streetViewControl: false,
    });

    map.addListener('click', (event: any) => {
        updateLocationOnMap({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

    marker = new google.maps.Marker({
        position: initialPosition,
        map: map,
        draggable: true,
        title: "Arrastra para cambiar la ubicación"
    });

    marker.addListener('dragend', (event: any) => {
        updateLocationOnMap({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

    const autocomplete = new google.maps.places.Autocomplete(locationInput, {
        fields: ["formatted_address", "geometry", "name"],
        types: ["(regions)"]
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            currentLocation = place.formatted_address || place.name;
            locationInput.value = currentLocation;
            updateLocationOnMap({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }, false);
        }
    });
  }

  function loadGoogleMapsScript() {
      if (document.getElementById('google-maps-script')) return;
      
      const GOOGLE_MAPS_API_KEY = 'AIzaSyAET9jDlPvuHq-aEoNB8jq8USeQz4tqpik';
      if (!GOOGLE_MAPS_API_KEY) {
          console.warn("Google Maps API key not configured. Map functionality is disabled.");
          if (mapElement) {
            (mapElement as HTMLElement).style.display = 'none';
          }
          return;
      }

      (window as any).initMap = initMap;
      
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
  }

  function initializeApp() {
    const savedLang = localStorage.getItem('preferredLanguage') as Language | null;
    const initialLang: Language = savedLang || 'es';
    currentLocation = locationInput.value;
    latestData = initialData[initialLang];
    setLanguage(initialLang);
    loadGoogleMapsScript();
  }

  function getIconForCategory(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes('finance') || cat.includes('bank')) return 'fa-landmark';
    if (cat.includes('service') || cat.includes('hospital') || cat.includes('health')) return 'fa-hospital-user';
    if (cat.includes('security') || cat.includes('police') || cat.includes('bomberos')) return 'fa-shield-halved';
    if (cat.includes('commerce') || cat.includes('market') || cat.includes('hotspot')) return 'fa-store';
    if (cat.includes('culture') || cat.includes('touris') || cat.includes('food')) return 'fa-masks-theater';
    if (cat.includes('education') || cat.includes('university')) return 'fa-graduation-cap';
    if (cat.includes('media') || cat.includes('news')) return 'fa-newspaper';
    return 'fa-chart-line';
  }

  function getWeatherIcon(iconKey: string): string {
      const key = iconKey.toLowerCase();
      if (key.includes('sun') && !key.includes('cloud')) return 'fa-sun';
      if (key.includes('cloud') && key.includes('sun')) return 'fa-cloud-sun';
      if (key.includes('cloud')) return 'fa-cloud';
      if (key.includes('rain')) return 'fa-cloud-showers-heavy';
      if (key.includes('snow')) return 'fa-snowflake';
      if (key.includes('bolt') || key.includes('storm')) return 'fa-bolt';
      return 'fa-smog';
  }

  function updateTopBar(locationName: string, weather: Weather) {
      locationInfoEl.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${locationName}</span>`;
      weatherInfoEl.innerHTML = `<i class="fas ${getWeatherIcon(weather.icon)}"></i><span>${weather.temperature}</span><span class="condition">${weather.condition}</span>`;
  }

  function updateUI(data: AppData, locationName: string) {
    if (!data) return;
    currentLocation = locationName;
    updateTopBar(locationName, data.weather);
    insightsTitle.textContent = translations[currentLanguage].insightsTitle.replace('{location}', locationName);

    // Reset newsletter placeholder content
    newsletterContent.innerHTML = `<p class="placeholder">${translations[currentLanguage].newsletterPlaceholder}</p>`;
    insightsGrid.innerHTML = '';
    
    if (!data.insights || data.insights.length === 0) {
      insightsGrid.innerHTML = `<p class="error">${translations[currentLanguage].noInsights}</p>`;
      copyButton.disabled = true;
      exportHtmlButton.disabled = true;
      shareLinkedinButton.disabled = true;
      viewNewsletterButton.disabled = true;
      return;
    }

    data.insights.forEach(insight => {
      const card = document.createElement('div');
      card.className = 'insight-card';
      card.innerHTML = `<div class="card-header"><i class="fas ${getIconForCategory(insight.category)} icon"></i><span>${insight.title}</span></div><div class="statistic">${insight.statistic}</div><div class="description">${insight.description}</div>`;
      insightsGrid.appendChild(card);
    });

    copyButton.disabled = false;
    exportHtmlButton.disabled = false;
    shareLinkedinButton.disabled = false;
    viewNewsletterButton.disabled = false;
  }

  const insightsAndNewsletterSchema = {
      type: Type.OBJECT,
      properties: {
          weather: { type: Type.OBJECT, description: "Current weather information.", properties: { temperature: { type: Type.STRING }, condition: { type: Type.STRING }, icon: { type: Type.STRING } }, required: ['temperature', 'condition', 'icon'] },
          insights: { type: Type.ARRAY, description: "List of key data points.", items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, statistic: { type: Type.STRING }, description: { type: Type.STRING }, category: { type: Type.STRING } }, required: ['title', 'statistic', 'description', 'category'] } },
          newsletterHtml: { type: Type.STRING, description: "Full newsletter content in HTML." }
      },
      required: ['weather', 'insights', 'newsletterHtml']
  };

  async function generateInsights(location: string) {
    generateButton.classList.add('loading');
    (generateButton.querySelector('span') as HTMLElement).textContent = translations[currentLanguage].generatingButton;
    insightsGrid.innerHTML = '';
    newsletterContent.innerHTML = `<p class="placeholder">${translations[currentLanguage].generatingNewsletter}</p>`;
    exportHtmlButton.disabled = true;
    shareLinkedinButton.disabled = true;
    copyButton.disabled = true;
    viewNewsletterButton.disabled = true;
    generateButton.disabled = true;
    
    const lang = currentLanguage;
    const textPrompt = `${translations[lang].promptInstruction} "${location}". ${translations[lang].promptDetails}`;

    try {
      const textResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: textPrompt,
          config: { responseMimeType: "application/json", responseSchema: insightsAndNewsletterSchema },
      });
      
      const result = JSON.parse(textResponse.text.trim()) as AppData;
      latestData = result;
      updateUI(latestData, location);

    } catch (error) {
      console.error("Error generating text insights:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const userFriendlyMessage = translations[currentLanguage].apiError.replace('{error}', errorMessage);
      insightsGrid.innerHTML = `<p class="error">${userFriendlyMessage}</p>`;
      newsletterContent.innerHTML = `<p class="error">${userFriendlyMessage}</p>`;
    } finally {
        generateButton.classList.remove('loading');
        (generateButton.querySelector('span') as HTMLElement).textContent = translations[currentLanguage].generateButton;
        generateButton.disabled = false;
    }
  }

  function copyNewsletterText() {
    if (!latestData) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = latestData.newsletterHtml;
    const textToCopy = tempDiv.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const copySpan = copyButton.querySelector('span')!;
        const originalText = copySpan.textContent;
        copySpan.textContent = translations[currentLanguage].copied;
        copyButton.classList.add('copied');
        setTimeout(() => {
            copySpan.textContent = originalText;
            copyButton.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Error copying text: ', err);
        alert(translations[currentLanguage].copyError);
    });
  }

  function exportAsHtml() {
    if (!latestData) return;
    const { newsletterHtml } = latestData;
    const lang = currentLanguage;
    const finalHtml = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${translations[lang].exportTitle}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:720px;margin:0 auto;padding:20px;}header,footer{text-align:center;padding:20px 0;}h1,h3{color:#0056b3;}ul{padding-left:20px;}li{margin-bottom:10px;}strong{color:#000;}.logo{width:80px;height:80px;}.container{padding:20px;border:1px solid #ddd;border-radius:8px;margin-top:20px;}</style></head><body><header><img src="https://goaltracker-ia.web.app/icons/icon-256x256.png" alt="Logo" class="logo"><h1>${translations[lang].exportTitle}</h1></header><div class="container">${newsletterHtml}</div><footer><a href="https://www.linkedin.com/newsletters/reto-al-100-en-data-science-7323581012427304962" target="_blank" style="display:inline-block;padding:10px 20px;margin:15px 0;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">${translations[lang].exportSubscribe}</a><p>${translations[lang].copyright}</p></footer></body></html>`;
    
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boletin-insights.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareToLinkedIn() {
      copyNewsletterText();
      const shareUrl = `https://www.linkedin.com/feed/?shareActive=true`;
      window.open(shareUrl, '_blank');
  }

  // --- Event Listeners ---
  insightsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (location) {
      currentLocation = location;
      generateInsights(location);
    }
  });

  copyButton.addEventListener('click', copyNewsletterText);
  exportHtmlButton.addEventListener('click', exportAsHtml);
  shareLinkedinButton.addEventListener('click', shareToLinkedIn);
  langSwitchers.forEach(switcher => {
    switcher.addEventListener('click', () => {
      const lang = switcher.getAttribute('data-lang') as Language;
      setLanguage(lang);
    });
  });

  viewNewsletterButton.addEventListener('click', openModal);
  modalCloseButton.addEventListener('click', closeModal);
  newsletterModal.addEventListener('click', (event) => {
    if (event.target === newsletterModal) {
      closeModal();
    }
  });

  // --- Initial Load ---
  initializeApp();
}

runApplication();