using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Entities;

namespace WarehouseManagement.Api.Data
{
    public class SmartWarehouseDbContext : DbContext
    {
        public SmartWarehouseDbContext(DbContextOptions<SmartWarehouseDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<WarehouseLocation> WarehouseLocations { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
        public DbSet<Company> Companies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global Query Filters (Soft Delete rule)
            modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<WarehouseLocation>().HasQueryFilter(w => !w.IsDeleted);
            modelBuilder.Entity<InventoryTransaction>().HasQueryFilter(i => !i.IsDeleted);

            // CompanyId index for performances
            modelBuilder.Entity<Product>().HasIndex(p => p.CompanyId);
            modelBuilder.Entity<WarehouseLocation>().HasIndex(w => w.CompanyId);
            modelBuilder.Entity<InventoryTransaction>().HasIndex(i => i.CompanyId);
            
            // Generate unique SKU code per company
            modelBuilder.Entity<Product>()
                .HasIndex(p => new { p.CompanyId, p.SkuCode })
                .IsUnique();
        }
    }
}
