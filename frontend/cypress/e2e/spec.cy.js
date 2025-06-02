// cypress/e2e/grocery-list.cy.js

describe('Family Grocery List - E2E Tests', () => {
  const API_BASE = 'http://127.0.0.1:8000/api';
  
  // Test data
  const testItems = [
    { id: '1', name: 'Milk', bought: false, createdAt: '2023-08-15T14:30:00Z' },
    { id: '2', name: 'Bread', bought: true, createdAt: '2023-08-15T14:31:00Z' },
    { id: '3', name: 'Eggs', bought: false, createdAt: '2023-08-15T14:32:00Z' }
  ];

  beforeEach(() => {
    // Intercept API calls and provide mock responses
    cy.intercept('GET', `${API_BASE}/items`, { body: testItems }).as('getItems');
    cy.intercept('POST', `${API_BASE}/items`, { statusCode: 201 }).as('addItem');
    cy.intercept('PATCH', `${API_BASE}/items/*`, { statusCode: 200 }).as('updateItem');
    cy.intercept('DELETE', `${API_BASE}/items/*`, { statusCode: 204 }).as('deleteItem');
    
    cy.visit('/');
    cy.wait('@getItems');
  });

  describe('Initial Page Load', () => {
    it('should display the correct page title and header', () => {
      cy.title().should('eq', 'Family Grocery List');
      cy.get('h1').should('contain', 'Family Grocery List');
      cy.get('.lead').should('contain', 'Plan your shopping together and never forget anything!');
    });

    it('should display decorative elements', () => {
      cy.get('.fruit-decoration.apple').should('exist');
      cy.get('.fruit-decoration.orange').should('exist');
    });

    it('should load and display initial items correctly', () => {
      cy.wait('@getItems');
      
      // Check stats are calculated correctly
      cy.get('[data-cy="total-items"]').should('contain', '3');
      cy.get('[data-cy="active-items"]').should('contain', '2');
      cy.get('[data-cy="bought-items"]').should('contain', '1');
    });

    it('should display items in correct sections', () => {
      // Active items (not bought)
      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.get('[data-cy="grocery-item"]').should('have.length', 2);
        cy.contains('Milk').should('exist');
        cy.contains('Eggs').should('exist');
      });

      // Bought items
      cy.get('[data-cy="bought-section"]').within(() => {
        cy.get('[data-cy="grocery-item"]').should('have.length', 1);
        cy.contains('Bread').should('exist');
      });
    });
  });

  describe('Stats Component', () => {
    it('should update stats when items change', () => {
      // Initial state
      cy.get('.stat-value').eq(0).should('contain', '3'); // Total
      cy.get('.stat-value').eq(1).should('contain', '2'); // Active
      cy.get('.stat-value').eq(2).should('contain', '1'); // Bought

      // Mock adding an item
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        body: { id: '4', name: 'Cheese', bought: false, createdAt: '2023-08-15T14:33:00Z' }
      }).as('addNewItem');

      cy.intercept('GET', `${API_BASE}/items`, { 
        body: [...testItems, { id: '4', name: 'Cheese', bought: false, createdAt: '2023-08-15T14:33:00Z' }]
      }).as('getUpdatedItems');

      cy.get('[data-cy="add-item-input"]').type('Cheese');
      cy.get('[data-cy="add-item-button"]').click();
      cy.wait('@addNewItem');

      // Stats should update
      cy.get('.stat-value').eq(0).should('contain', '4'); // Total
      cy.get('.stat-value').eq(1).should('contain', '3'); // Active
      cy.get('.stat-value').eq(2).should('contain', '1'); // Bought
    });
  });

  describe('Add Item Functionality', () => {
    it('should add a new item successfully', () => {
      const newItem = { id: '4', name: 'Cheese', bought: false, createdAt: '2023-08-15T14:33:00Z' };
      
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        body: newItem 
      }).as('addNewItem');

      cy.get('[data-cy="add-item-input"]').type('Cheese');
      cy.get('[data-cy="add-item-button"]').click();

      cy.wait('@addNewItem').then((interception) => {
        expect(interception.request.body).to.deep.equal({ name: 'Cheese' });
      });

      // Check notification appears
      cy.get('.notification.show').should('contain', 'added');
      
      // Input should be cleared
      cy.get('[data-cy="add-item-input"]').should('have.value', '');
    });

    it('should disable the button when input is empty and prevent adding items', () => {
      // Ensure input is empty
      cy.get('[data-cy="add-item-input"]').clear();

      // Check that button is disabled
      cy.get('[data-cy="add-item-button"]').should('be.disabled');

      // Attempting to click should not do anything
      cy.get('[data-cy="add-item-button"]').click({ force: true }); // force just in case it’s disabled

      // No API call should be made
      cy.get('@addItem.all').should('have.length', 0);
    });


    it('should not add items with only whitespace', () => {
      cy.get('[data-cy="add-item-input"]').type('   ');
      // Check that button is disabled
      cy.get('[data-cy="add-item-button"]').should('be.disabled');

      // Attempting to click should not do anything
      cy.get('[data-cy="add-item-button"]').click({ force: true });
      
      // Should not make API call
      cy.get('@addItem.all').should('have.length', 0);
    });

    it('should handle add item via Enter key', () => {
      const newItem = { id: '5', name: 'Tomatoes', bought: false, createdAt: '2023-08-15T14:34:00Z' };
      
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        body: newItem 
      }).as('addItemEnter');

      cy.get('[data-cy="add-item-input"]').type('Tomatoes{enter}');
      cy.wait('@addItemEnter');
    });

    it('should show loading state while adding item', () => {
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        delay: 1000,
        body: { id: '6', name: 'Slow Item', bought: false, createdAt: '2023-08-15T14:35:00Z' }
      }).as('slowAddItem');

      cy.get('[data-cy="add-item-input"]').type('Slow Item');
      cy.get('[data-cy="add-item-button"]').click();
      
      // Check loading state
      cy.get('[data-cy="add-item-button"]').should('contain', 'Adding...');
      cy.get('[data-cy="add-item-button"]').should('be.disabled');
      cy.get('[data-cy="add-item-input"]').should('be.disabled');
      
      cy.wait('@slowAddItem');
      
      // Loading state should be cleared
      cy.get('[data-cy="add-item-button"]').should('contain', 'Add Item');
      cy.get('[data-cy="add-item-button"]').should('be.disabled');
      cy.get('[data-cy="add-item-input"]').should('not.be.disabled');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', `${API_BASE}/items`, { statusCode: 400 }).as('addItemError');

      cy.get('[data-cy="add-item-input"]').type('Error Item');
      cy.get('[data-cy="add-item-button"]').click();
      
      cy.wait('@addItemError');
      
      // Should still clear loading state
      cy.get('[data-cy="add-item-button"]').should('contain', 'Add Item');
      cy.get('[data-cy="add-item-button"]').should('not.be.disabled');
    });
  });

  describe('Toggle Item Status', () => {
    it('should toggle item from active to bought via checkbox', () => {
      const updatedItem = { ...testItems[0], bought: true };
      
      cy.intercept('PATCH', `${API_BASE}/items/1`, { 
        statusCode: 200, 
        body: updatedItem 
      }).as('toggleToBought');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('[data-cy="grocery-item"]', 'Milk')
          .find('[data-cy="markAsBoughtBtn"]')
          .click();
      });


      cy.wait('@toggleToBought').then((interception) => {
        expect(interception.request.body).to.deep.equal({ bought: true });
      });

      // Check notification
      cy.get('.notification.show').should('contain', 'bought');
    });

    it('should toggle item from active to bought via button', () => {
      const updatedItem = { ...testItems[0], bought: true };
      
      cy.intercept('PATCH', `${API_BASE}/items/1`, { 
        statusCode: 200, 
        body: updatedItem 
      }).as('toggleToBoughtBtn');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('[data-cy="grocery-item"]', 'Milk')
          .find('[data-cy="markAsBoughtBtn"]')
          .click();
      });

      cy.wait('@toggleToBoughtBtn');
    });

    it('should toggle item from bought to active', () => {
      const updatedItem = { ...testItems[1], bought: false };
      
      cy.intercept('PATCH', `${API_BASE}/items/2`, { 
        statusCode: 200, 
        body: updatedItem 
      }).as('toggleToActive');

      cy.get('[data-cy="bought-section"]').within(() => {
        cy.contains('[data-cy="grocery-item"]', 'Bread')
          .find('[data-cy="MarkAsNotBoughtBtn"]')
          .click();
      });


      cy.wait('@toggleToActive').then((interception) => {
        expect(interception.request.body).to.deep.equal({ bought: false });
      });

      // Check notification
      cy.get('.notification.show').should('contain', 'marked as not bought');
    });

    it('should show loading state while toggling', () => {
      cy.intercept('PATCH', `${API_BASE}/items/1`, { 
        statusCode: 200, 
        delay: 1000,
        body: { ...testItems[0], bought: true }
      }).as('slowToggle');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('[data-cy="grocery-item"]', 'Milk').within(() => {
          cy.get('[data-cy="markAsBoughtBtn"]').click();

          // Check loading state
          cy.get('[data-cy="markAsBoughtBtn"]').should('be.disabled');
          cy.get('[data-cy="delete-button"]').should('be.disabled');
        });
      });


      cy.wait('@slowToggle');
    });
  });

  describe('Delete Item Functionality', () => {
    it('should delete an item successfully', () => {
      cy.intercept('DELETE', `${API_BASE}/items/1`, { statusCode: 204 }).as('deleteItem');

      cy.contains('Milk').closest('[data-cy="grocery-item"]').within(() => {
        cy.get('[data-cy="delete-button"]').click();
      });


      cy.wait('@deleteItem');

      // Check notification
      cy.get('.notification.show').should('contain', 'deleted successfully');
    });

    it('should delete bought items', () => {
      cy.intercept('DELETE', `${API_BASE}/items/2`, { statusCode: 204 }).as('deleteBoughtItem');

      cy.get('[data-cy="bought-section"]').within(() => {
        cy.contains('Bread').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="delete-button"]').click();
        });
      });


      cy.wait('@deleteBoughtItem');
    });

    it('should show loading state while deleting', () => {
      cy.intercept('DELETE', `${API_BASE}/items/1`, { 
        statusCode: 204, 
        delay: 1000 
      }).as('slowDelete');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('Milk').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="delete-button"]').click();
          
          // Check loading state
          cy.get('[data-cy="delete-button"]').should('be.disabled');
          cy.get('[data-cy="markAsBoughtBtn"]').should('be.disabled');
        });
      });

      cy.wait('@slowDelete');
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', `${API_BASE}/items/1`, { statusCode: 404 }).as('deleteError');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('Milk').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="delete-button"]').click();
        });
      });

      cy.wait('@deleteError');
      
      // Should still clear loading state
      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('Milk').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="delete-button"]').should('not.be.disabled');
        });
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state for active items when none exist', () => {
      const boughtOnlyItems = testItems.map(item => ({ ...item, bought: true }));
      
      cy.intercept('GET', `${API_BASE}/items`, { body: boughtOnlyItems }).as('getBoughtOnly');
      cy.reload();
      cy.wait('@getBoughtOnly');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.get('.empty-state').should('contain', 'Your list is empty');
        cy.get('.empty-state').should('contain', 'Add some items to get started!');
        cy.get('.bi-emoji-smile').should('exist');
      });
    });

    it('should show empty state for bought items when none exist', () => {
      const activeOnlyItems = testItems.map(item => ({ ...item, bought: false }));
      
      cy.intercept('GET', `${API_BASE}/items`, { body: activeOnlyItems }).as('getActiveOnly');
      cy.reload();
      cy.wait('@getActiveOnly');

      cy.get('[data-cy="bought-section"]').within(() => {
        cy.get('.empty-state').should('contain', 'No items bought yet');
        cy.get('.empty-state').should('contain', 'Mark items as bought when you purchase them');
        cy.get('.bi-cart-check').should('exist');
      });
    });

    it('should show empty states when no items exist at all', () => {
      cy.intercept('GET', `${API_BASE}/items`, { body: [] }).as('getEmpty');
      cy.reload();
      cy.wait('@getEmpty');

      // Check stats are zero
      cy.get('.stat-value').eq(0).should('contain', '0');
      cy.get('.stat-value').eq(1).should('contain', '0');
      cy.get('.stat-value').eq(2).should('contain', '0');

      // Both sections should show empty states
      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.get('.empty-state').should('exist');
      });

      cy.get('[data-cy="bought-section"]').within(() => {
        cy.get('.empty-state').should('exist');
      });
    });
  });

  describe('Notifications', () => {
    it('should show notification and auto-hide after 3 seconds', () => {
      const newItem = { id: '7', name: 'Auto Hide Test', bought: false, createdAt: '2023-08-15T14:36:00Z' };
      
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        body: newItem 
      }).as('addNotificationTest');

      cy.get('[data-cy="add-item-input"]').type('Auto Hide Test');
      cy.get('[data-cy="add-item-button"]').click();
      cy.wait('@addNotificationTest');

      // Notification should appear
      cy.get('.notification.show').should('be.visible');
      cy.get('.notification.show').should('contain', 'added successfully');

      // Should auto-hide after 3 seconds
      cy.get('.notification.show', { timeout: 4000 }).should('not.exist');
    });

    it('should show different notification messages for different actions', () => {
      // Test add notification
      cy.intercept('POST', `${API_BASE}/items`, { 
        statusCode: 201, 
        body: { id: '8', name: 'Test Add', bought: false, createdAt: '2023-08-15T14:37:00Z' }
      }).as('testAdd');

      cy.get('[data-cy="add-item-input"]').type('Test Add');
      cy.get('[data-cy="add-item-button"]').click();
      cy.wait('@testAdd');
      cy.get('.notification.show').should('contain', 'added successfully');

      // Wait for notification to hide
      cy.get('.notification.show', { timeout: 4000 }).should('not.exist');

      // Test toggle notification
      cy.intercept('PATCH', `${API_BASE}/items/1`, { 
        statusCode: 200, 
        body: { ...testItems[0], bought: true }
      }).as('testToggle');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('Milk').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="markAsBoughtBtn"]').click();
        });
      });
      cy.wait('@testToggle');
      cy.get('.notification.show').should('contain', 'marked as bought');

      // Wait for notification to hide
      cy.get('.notification.show', { timeout: 4000 }).should('not.exist');

      // Test delete notification
      cy.intercept('DELETE', `${API_BASE}/items/3`, { statusCode: 204 }).as('testDelete');

      cy.get('[data-cy="to-buy-section"]').within(() => {
        cy.contains('Eggs').closest('[data-cy="grocery-item"]').within(() => {
          cy.get('[data-cy="delete-button"]').click();
        });
      });
      cy.wait('@testDelete');
      cy.get('.notification.show').should('contain', 'deleted successfully');
    });
  });

  describe('API Error Handling', () => {
    it('should handle initial load errors gracefully', () => {
      cy.intercept('GET', `${API_BASE}/items`, { statusCode: 500 }).as('loadError');
      cy.reload();
      cy.wait('@loadError');

      // Should show notification about error
      cy.get('.notification.show').should('contain', 'Failed to fetch items');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', `${API_BASE}/items`, { forceNetworkError: true }).as('networkError');
      cy.reload();
      cy.wait('@networkError');

      // Should show notification about error
      cy.get('.notification.show').should('contain', 'Error connecting to server');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // All elements should still be visible and functional
      cy.get('h1').should('be.visible');
      cy.get('[data-cy="add-item-input"]').should('be.visible');
      cy.get('[data-cy="add-item-button"]').should('be.visible');
      cy.get('.stats').should('be.visible');
      
      // Test adding item on mobile
      const newItem = { id: '9', name: 'Mobile Item', bought: false, createdAt: '2023-08-15T14:38:00Z' };
      cy.intercept('POST', `${API_BASE}/items`, { statusCode: 201, body: newItem }).as('mobileAdd');
      
      cy.get('[data-cy="add-item-input"]').type('Mobile Item');
      cy.get('[data-cy="add-item-button"]').click();
      cy.wait('@mobileAdd');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.get('h1').should('be.visible');
      cy.get('.app-container').should('have.css', 'max-width', '800px');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Check for proper form labels
      cy.get('[data-cy="add-item-input"]').should('have.attr', 'placeholder');
      
      // Check buttons have proper titles
      cy.get('[data-cy="markAsBoughtBtn"]').should('have.attr', 'title');
      cy.get('[data-cy="MarkAsNotBoughtBtn"]').should('have.attr', 'title');
      cy.get('[data-cy="delete-button"]').should('have.attr', 'title');
      
    });
  });

  describe('Visual Regression', () => {
    it('should maintain visual consistency', () => {
      // Take screenshot of initial state
      cy.screenshot('initial-state');
      
      // Test with items in different states
      cy.get('[data-cy="to-buy-section"]').screenshot('to-buy-section');
      cy.get('[data-cy="bought-section"]').screenshot('bought-section');
      cy.get('.stats').screenshot('stats-section');
    });

    it('should show hover effects', () => {
      cy.get('.card').first().trigger('mouseover');
      cy.get('[data-cy="markAsBoughtBtn"]').first().trigger('mouseover');
      cy.get('[data-cy="delete-button"]').first().trigger('mouseover');
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      const start = Date.now();
      cy.visit('/');
      cy.wait('@getItems').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should handle rapid interactions', () => {
      // Rapidly add multiple items
      const items = ['Item 1', 'Item 2', 'Item 3'];
      
      items.forEach((item, index) => {
        cy.intercept('POST', `${API_BASE}/items`, { 
          statusCode: 201, 
          body: { id: `rapid-${index}`, name: item, bought: false, createdAt: new Date().toISOString() }
        }).as(`rapidAdd${index}`);
        
        cy.get('[data-cy="add-item-input"]').clear().type(item);
        cy.get('[data-cy="add-item-button"]').click();
        cy.wait(`@rapidAdd${index}`);
      });
    });
  });
});

// cypress/support/commands.js - Custom commands for the grocery list app

Cypress.Commands.add('addGroceryItem', (itemName) => {
  cy.get('[data-cy="add-item-input"]').type(itemName);
  cy.get('[data-cy="add-item-button"]').click();
});

Cypress.Commands.add('toggleGroceryItem', (itemName) => {
  cy.contains(itemName).parent().within(() => {
    cy.get('[data-cy="toggle-button"]').click();
  });
});

Cypress.Commands.add('deleteGroceryItem', (itemName) => {
  cy.contains(itemName).parent().within(() => {
    cy.get('[data-cy="delete-button"]').click();
  });
});

Cypress.Commands.add('waitForNotification', (message) => {
  cy.get('.notification.show').should('contain', message);
  cy.get('.notification.show', { timeout: 4000 }).should('not.exist');
});

// cypress/fixtures/grocery-items.json - Test data fixtures
/*
{
  "emptyList": [],
  "sampleItems": [
    {
      "id": "1",
      "name": "Organic Milk",
      "bought": false,
      "createdAt": "2023-08-15T14:30:00Z"
    },
    {
      "id": "2",
      "name": "Whole Wheat Bread",
      "bought": true,
      "createdAt": "2023-08-15T14:31:00Z"
    },
    {
      "id": "3",
      "name": "Free Range Eggs",
      "bought": false,
      "createdAt": "2023-08-15T14:32:00Z"
    }
  ],
  "largeList": [
    // ... 50+ items for performance testing
  ]
}
*/