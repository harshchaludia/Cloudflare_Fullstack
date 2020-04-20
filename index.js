// Hey Cloudflare Team, I hope you guys are doing well !
// Thank you for considering me as an eligible candidate.
// I have implemented the requested modules as well as the extra-credit modules.
// I have tried my best to include comments, and variables are clearly depicted.
// Looking forward to more challenges.

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Make a fetch request to the URL https://cfw-takehome.developers.workers.dev/api/variants,
 * and parse the response as JSON.
 * The response will be an array of URLs, which is saved to a variable.
 * Task 1 of the requirements from the README.md i.e Requesting the URLs from the API is implemented below.
**/

async function FetchVariants(request) {
  // Storing the URL in a constant variable
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants'
  
  var data = await fetch(url);

  //  Parsing the response JSON object by requesting on the API
  let jsonData = await data.json();
  
  // Storing the response as an array of URLs, saving as a dataArray variable.
  let dataArray = jsonData.variants
  
  // Printing the dataArray to confirm.
  console.log(dataArray)
  
  // Return the dataArray
  return dataArray;

}

/**
 * Fetching a random variant URL, and random number each time when this function is called. 
 * Task 2 of the requirements from the README.md i.e Requesting random variant is implemented below.
**/
async function FetchRandomURL(variants_data) {

    var arr = [];
    // Using the random() function to choose either the first or the second variant with a 50/50 chance.
    const random = Math.random() < 0.5 ? 0:1;
    // Declaring a constant random variable, to select a variant from the variants_data array
    const randomURL = variants_data[random];

    // Appending the random number, and randomURL which can be used further.
    arr.push(random, randomURL)
  
    // Returning the arr
    return arr;

}


/**
 * Handling requests, and returning the relevant response
 * Task 3 of the requirements from the README.md i.e Distributing requests between variants is implemented below.
 * Implemented the Extra Credit Task 2 
**/
async function handleRequest(request) {

  // Grabbing a cookie from the header.
  const cookie = request.headers.get('cookie');

  // Fetching the variants by calling FetchVariants(), response would be an array.
  const variants_data = await FetchVariants(request);

  // Fetching the Visitor IP.
  let visitor_ip = request.headers.get("cf-connecting-ip");

  // Fetching the Visitor IP Location.
  let country_ip = request.headers.get("cf-ipcountry");

  if (cookie && cookie.includes('identification=first'))
  { 
    // CASE 1, If the cookie is already present
    // And, If the headers containing Set-cookie already includes variant data (identification=first)
    // then show 'https://cfw-takehome.developers.workers.dev/api/variants/1' 
    
    // Generating response and returning the first variant
    const response = await BuildResponse(variants_data[0], 1, visitor_ip,country_ip)
    return response;
  }
  
  

  else if (cookie && cookie.includes('identification=second'))
  {
    // CASE 2, If the cookie is already present
    // And, If the headers containing Set-cookie already includes variant data (identification=second)
    // then show 'https://cfw-takehome.developers.workers.dev/api/variants/2' 
   
    // Generating response and returning the second variant
    const response = await BuildResponse(variants_data[1], 2, visitor_ip,country_ip)
    return response;
  } 

  else 
  {
    // CASE 3, if there are no cookies present, being a new session, we generate a random variant. 
    // And, setting the cookie with its expiry.

    // Storing the current date.
    var expiry_date = new Date();

    // Setting the time when the cookie expires and resets.
    // For temporary purpose, we assume the expiry in minutes,
    // Hence we set the minutes variable.
    let minutes = 6
    expiry_date.setMinutes(expiry_date.getMinutes() + minutes);

    // Fetching the random url from the FetchRandomURL function.
    const arr = await FetchRandomURL(variants_data);

    const random = arr[0]
    const randomURL = arr[1]

    // Setting the Variant choice which is used further in setting the header(Set-Cookie).
    if (random === 0)
    {
      VariantChoice = 'first';
    }
    else
    {
      VariantChoice = 'second';
    }

    // Finally building the response by passing all the constants generated above. 
    const response = await BuildResponse(randomURL,random+1,visitor_ip,country_ip);

    // Extra Credit Task 2 -- Persisting variants
    // If a user visits the site and receives one of the two URLs, 
    // we save the information in the identification field of Set-Cookie from Headers.
    // So that they always see the same variant when they return to the application.
    // Setting the expiry date of Set-Cookie from the header to implement the cookie expiry method.
    response.headers.set('Set-Cookie', `identification=${VariantChoice};expires=`+expiry_date.toUTCString());

    return response;
  }
}

/**
 * Implemented the Extra Credit Task 1 - Changing copy/URLs 
 * Here, it takes the URL and its Variant, giving a new response.
 * For each of these elements, elementHandlers are created to organize effectively.
**/
async function BuildResponse(URL, var_number, visitor_ip, country_ip) { 

   // Header Element Handler, displaying the IP and its Country Location 
   class HeaderElementHandler {
    element(element) {
      element.setAttribute("style", var_number == 1 ? "color: red; font-weight: bolder; font-family: Arial":"color: Blue; font-weight: bolder; font-family: Arial");
      element.setInnerContent(`Hey, ${visitor_ip} from ${country_ip}, This is Variant ${var_number}.`);
    }
  }

  // Title Element Handler, displaying as html title.
  class TitleElementHandler {
    element(element) {
      element.setInnerContent(var_number == 1 ? "First Variant":"Second Variant");
    }
  }

  // Description Element Handler, displaying the cookies saved message.
  class DescriptionElementHandler {
    element(element) {
      element.setAttribute("style", var_number == 1 ? "color: green; font-weight: bolder; font-family: Arial":"color: orange; font-weight: bolder; font-family: Arial");
      element.setInnerContent(`Your cookie is saved now!`);
    }
  }

  // Description Element Handler, displaying my linkedin profile.
  class LinkElementHandler {
    element(element) {
      element.setInnerContent(`Let's Talk`);
      element.setAttribute("href", "https://linkedin.com/in/harshchaludia");
    }
  }

  // For each case on title, h1#title, p#description, and a#url, we initialize the HTMLRewriter() to model/ render the HTML on Browser.
  const responseFinal = await fetch(URL);
  return new HTMLRewriter()
  .on('title', new TitleElementHandler())
  .on('h1#title', new HeaderElementHandler())
  .on('p#description', new DescriptionElementHandler())
  .on('a#url', new LinkElementHandler())
  .transform(responseFinal);
}