"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, MessageSquare, Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

const commentsData = [
  {
    id: 1,
    user: "Leslie Alexander",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Dude, I am unable to download, please check the link 😊",
    time: "Aug 15",
    product: "Yellow Helmet",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "3D Product",
  },
  {
    id: 2,
    user: "Brooklyn Simmons",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Dude, I am unable to download, please check the link 😊",
    time: "Apr 17",
    product: "Yellow Helmet",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "3D Product",
  },
  {
    id: 3,
    user: "Jordan Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "I found this links Thanks for your help! 😊",
    time: "Aug 16",
    product: "Red Backpack",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "3D Graphic",
  },
  {
    id: 4,
    user: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Can you send me the link again? I missed it!",
    time: "Aug 17",
    product: "Blue Sneakers",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "3D Model",
  },
  {
    id: 5,
    user: "Taylor Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "I encountered an error while downloading, can you assist?",
    time: "Aug 18",
    product: "Green Jacket",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "2D Icon",
  },
  {
    id: 6,
    user: "Morgan Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "Thanks for the update! The link works perfectly now 😊",
    time: "Aug 19",
    product: "Purple Scarf",
    productImage: "/placeholder.svg?height=32&width=32",
    category: "3D Render",
  },
]

export default function SellerCommentsPage() {
  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-sm text-gray-600">Comments</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Products</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search product" className="pl-10 w-64 bg-gray-50 border-gray-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {commentsData.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox />

                    <div className="flex items-start space-x-3 flex-1">
                      <img
                        src={comment.avatar || "/placeholder.svg"}
                        alt={comment.user}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.user}</span>
                          <span className="text-sm text-gray-500">{comment.time}</span>
                        </div>

                        <p className="text-sm text-gray-800 mb-3">{comment.message}</p>

                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>Reply</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600">
                            <Heart className="w-4 h-4" />
                            <span>Like</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{comment.product}</p>
                      <p className="text-xs text-gray-500">{comment.category}</p>
                    </div>
                    <img
                      src={comment.productImage || "/placeholder.svg"}
                      alt={comment.product}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-center space-x-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
