var data = {};
var currentSearchMode = 1; // 1: nombre, 2: categoría, 3: región, 4: ingrediente

const form = document.querySelector("form");
const inputs = document.querySelectorAll('.input');

// Agregar listener a cada input
inputs.forEach(input => {
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            getMeal();
        }
    });
});

// Selectores de búsqueda
const search_nombre = document.getElementById("search_nombre");
search_nombre.addEventListener("click", () => {
    changeSearchMode(1);
});

const search_categoria = document.getElementById("search_categoria");
search_categoria.addEventListener("click", () => {
    changeSearchMode(2);
});

const search_region = document.getElementById("search_region");
search_region.addEventListener("click", () => {
    changeSearchMode(3);
});

const search_ingrediente = document.getElementById("search_ingrediente");
search_ingrediente.addEventListener("click", () => {
    changeSearchMode(4);
});

function changeSearchMode(mode) {
    currentSearchMode = mode;
    
    // Remover clase 'active' de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ocultar todos los inputs
    document.getElementById("busqueda_nombre").style.display = "none";
    document.getElementById("busqueda_categoria").style.display = "none";
    document.getElementById("busqueda_region").style.display = "none";
    document.getElementById("busqueda_ingrediente").style.display = "none";
    
    // Actualizar interfaz según el modo seleccionado
    const searchIndicator = document.getElementById("search_indicador");
    
    switch(mode) {
        case 1:
            search_nombre.classList.add('active');
            document.getElementById("busqueda_nombre").style.display = "block";
            searchIndicator.innerHTML = "<strong>Modo de búsqueda:</strong> Por nombre";
            break;
        case 2:
            search_categoria.classList.add('active');
            document.getElementById("busqueda_categoria").style.display = "block";
            searchIndicator.innerHTML = "<strong>Modo de búsqueda:</strong> Por categoría";
            break;
        case 3:
            search_region.classList.add('active');
            document.getElementById("busqueda_region").style.display = "block";
            searchIndicator.innerHTML = "<strong>Modo de búsqueda:</strong> Por región";
            break;
        case 4:
            search_ingrediente.classList.add('active');
            document.getElementById("busqueda_ingrediente").style.display = "block";
            searchIndicator.innerHTML = "<strong>Modo de búsqueda:</strong> Por ingrediente";
            break;
    }
}

async function getMeal() {
    let input;
    
    // Obtener el valor del input correspondiente al modo actual
    switch(currentSearchMode) {
        case 1:
            input = document.getElementById("busqueda_nombre").value;
            break;
        case 2:
            input = document.getElementById("busqueda_categoria").value;
            break;
        case 3:
            input = document.getElementById("busqueda_region").value;
            break;
        case 4:
            input = document.getElementById("busqueda_ingrediente").value;
            break;
    }
    
    if (input.trim() === "") {
        alert("Por favor escribe algo para buscar");
        return;
    }

    await collectData(input);
    mostrarPlatillos();
}

async function collectData(searchTerm) {
    let url;
    
    switch(currentSearchMode) {
        case 1:
            url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`;
            break;
        case 2:
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${searchTerm}`;
            break;
        case 3:
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${searchTerm}`;
            break;
        case 4:
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchTerm}`;
            break;
    }
    
    try {
        const response = await fetch(url);
        data = await response.json();
        
        if (!data.meals) {
            alert("No se encontraron platillos con esa búsqueda :(");
            data = {};
            return;
        }
        
        if (currentSearchMode !== 1) {
            await getMealDetails();
        }
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("Hubo un error al buscar los platillos");
    }
}

async function getMealDetails() {
    const detailedMeals = [];
    
    for (let meal of data.meals) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            const mealData = await response.json();
            if (mealData.meals && mealData.meals[0]) {
                detailedMeals.push(mealData.meals[0]);
            }
        } catch (error) {
            console.error(`Error al obtener detalles del platillo ${meal.idMeal}:`, error);
        }
    }
    
    data.meals = detailedMeals;
}

function mostrarPlatillos() {
    var mainContainer = document.getElementById("main-container");
    mainContainer.innerHTML = "";

    if (!data.meals || data.meals.length === 0) {
        mainContainer.innerHTML = "<p>No se encontraron resultados</p>";
        return;
    }

    for (let i = 0; i < data.meals.length; i++) {
        const meal = data.meals[i];
        
        var container = document.createElement("div");
        container.className = "container";

        var row1 = document.createElement("div");

        var imgDiv = document.createElement("div");
        imgDiv.className = "img";
        imgDiv.style.backgroundImage = `url('${meal.strMealThumb}')`;

        var contentContainer = document.createElement("div");
        contentContainer.className = "content-container";

        var title = document.createElement("h1");
        title.className = "title";
        title.textContent = meal.strMeal;

        var category = document.createElement("p");
        category.className = "category-info";
        category.innerHTML = `<strong>Categoría:</strong> ${meal.strCategory} | <strong>Área:</strong> ${meal.strArea}`;

        var ingredientsTitle = document.createElement("h3");
        ingredientsTitle.textContent = "Ingredientes:";
        
        var ingredientsList = document.createElement("ul");
        ingredientsList.className = "ingredients-list";
        
        for (let j = 1; j <= 20; j++) {
            const ingredient = meal[`strIngredient${j}`];
            const measure = meal[`strMeasure${j}`];
            
            if (ingredient && ingredient.trim() !== "") {
                var li = document.createElement("li");
                li.textContent = `${measure} ${ingredient}`;
                ingredientsList.appendChild(li);
            }
        }

        var instructionsTitle = document.createElement("h3");
        instructionsTitle.textContent = "Instrucciones:";
        
        var instructions = document.createElement("p");
        instructions.className = "info";
        instructions.textContent = meal.strInstructions;

        contentContainer.appendChild(title);
        contentContainer.appendChild(category);
        contentContainer.appendChild(instructionsTitle);
        contentContainer.appendChild(instructions);

        row1.appendChild(imgDiv);
        row1.appendChild(ingredientsTitle);
        row1.appendChild(ingredientsList);
        container.appendChild(row1);
        container.appendChild(contentContainer);
        
        mainContainer.appendChild(container);
    }
}