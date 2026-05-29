"use client"

import { useEffect, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import type { Product, ProductFilters } from "@/types/product"

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: React.Dispatch<React.SetStateAction<ProductFilters>>
  products: Product[]
}

function countByValue(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    const normalized = value.trim()
    if (!normalized) return counts
    counts[normalized] = (counts[normalized] || 0) + 1
    return counts
  }, {})
}

function toOptions(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => first.name.localeCompare(second.name))
}

export default function ProductFiltersComponent({
  filters,
  onFiltersChange,
  products,
}: ProductFiltersProps) {
  const categoryOptions = useMemo(
    () => toOptions(countByValue(products.map((product) => product.categoryName))),
    [products]
  )

  const brandOptions = useMemo(
    () => toOptions(countByValue(products.map((product) => product.brandName))),
    [products]
  )

  const tagOptions = useMemo(
    () => toOptions(countByValue(products.flatMap((product) => product.tags || []))),
    [products]
  )

  const maxPriceFromProducts = useMemo(
    () => (products.length > 0 ? Math.max(...products.map((product) => product.price)) : 0),
    [products]
  )

  useEffect(() => {
    onFiltersChange((current) => {
      const availableCategories = new Set(categoryOptions.map((option) => option.name))
      const availableBrands = new Set(brandOptions.map((option) => option.name))
      const availableTags = new Set(tagOptions.map((option) => option.name))
      const nextCategories = current.categories.filter((category) => availableCategories.has(category))
      const nextBrands = current.brands.filter((brand) => availableBrands.has(brand))
      const nextTags = current.tags.filter((tag) => availableTags.has(tag))
      const nextMaxPrice = maxPriceFromProducts || 0
      const shouldResetMaxPrice = current.priceRange[1] === 0 || current.priceRange[1] > nextMaxPrice
      const nextPriceRange: [number, number] = [
        Math.min(current.priceRange[0], nextMaxPrice),
        shouldResetMaxPrice ? nextMaxPrice : current.priceRange[1],
      ]

      if (
        nextCategories.length === current.categories.length &&
        nextBrands.length === current.brands.length &&
        nextTags.length === current.tags.length &&
        nextPriceRange[0] === current.priceRange[0] &&
        nextPriceRange[1] === current.priceRange[1]
      ) {
        return current
      }

      return {
        ...current,
        categories: nextCategories,
        brands: nextBrands,
        tags: nextTags,
        priceRange: nextPriceRange,
      }
    })
  }, [brandOptions, categoryOptions, maxPriceFromProducts, onFiltersChange, tagOptions])

  const toggleFilterValue = (field: "categories" | "brands" | "tags", value: string, checked: boolean) => {
    onFiltersChange((current) => ({
      ...current,
      [field]: checked ? [...current[field], value] : current[field].filter((item) => item !== value),
    }))
  }

  const handlePriceChange = (value: number[]) => {
    onFiltersChange((current) => ({ ...current, priceRange: [value[0], value[1]] }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc theo danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-[#687d76]">Chưa có danh mục</p>
          ) : (
            categoryOptions.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.name}`}
                    checked={filters.categories.includes(category.name)}
                    onCheckedChange={(checked) => toggleFilterValue("categories", category.name, checked === true)}
                  />
                  <label htmlFor={`category-${category.name}`} className="cursor-pointer text-sm font-medium">
                    {category.name}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc theo giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            max={maxPriceFromProducts}
            min={0}
            step={1000}
            disabled={maxPriceFromProducts === 0}
          />
          <div className="flex items-center justify-between text-sm">
            <span>
              Giá: {new Intl.NumberFormat("vi-VN").format(filters.priceRange[0])} đ -{" "}
              {new Intl.NumberFormat("vi-VN").format(filters.priceRange[1])} đ
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc theo thương hiệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brandOptions.length === 0 ? (
            <p className="text-sm text-[#687d76]">Chưa có thương hiệu</p>
          ) : (
            brandOptions.map((brand) => (
              <div key={brand.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.name}`}
                    checked={filters.brands.includes(brand.name)}
                    onCheckedChange={(checked) => toggleFilterValue("brands", brand.name, checked === true)}
                  />
                  <label htmlFor={`brand-${brand.name}`} className="cursor-pointer text-sm font-medium">
                    {brand.name}
                  </label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {brand.count}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc theo thẻ</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {tagOptions.length === 0 ? (
            <p className="text-sm text-[#687d76]">Chưa có thẻ</p>
          ) : (
            tagOptions.map((tag) => (
              <Badge
                key={tag.name}
                variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilterValue("tags", tag.name, !filters.tags.includes(tag.name))}
              >
                {tag.name}
                <span className="ml-1 text-[10px] opacity-70">({tag.count})</span>
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
